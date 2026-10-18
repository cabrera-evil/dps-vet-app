import { isAxiosError } from 'axios';

import { parseApiError } from '@/lib/api-error';
import {
	create,
	list,
	setTokenProvider,
	setUnauthorizedHandler,
} from '@/lib/rest';
import {
	clearRefreshToken,
	getRefreshToken,
	setRefreshToken,
} from '@/lib/token-store';
import type {
	AuthUser,
	PermissionsResponse,
	TokenIssued,
	TokenResponse,
} from '@/types/auth';
import type { ApiResponse } from '@/types/rest';
import { isCustomerAccount } from '@/utils/permission';

// Session engine: tokens, single-flight refresh and the customer gate. React-free so the
// REST layer can use it; features/auth/auth-session-context.tsx wraps it for the UI.
// The idToken and its expiry live in module memory only; the refreshToken lives in SecureStore.

const REFRESH_MARGIN_MS = 60_000;
const AUTH_URL = {
	token: '/auth/token',
	refresh: '/auth/refresh',
	logout: '/auth/logout',
	permissions: '/auth/permissions',
} as const;

export type AuthErrorCode =
	| 'invalid-credentials'
	| 'rate-limited'
	| 'not-customer'
	| 'network'
	| 'verify-failed'
	| 'validation'
	| 'unknown';

export class AuthError extends Error {
	constructor(
		readonly code: AuthErrorCode,
		readonly fieldErrors: Record<string, string> = {}
	) {
		super(code);
	}
}

let idToken: string | null = null;
let expiresAt = 0;
let refreshInFlight: Promise<string> | null = null;
// Bumped on every session change so a refresh that resolves after sign-out cannot resurrect tokens.
let epoch = 0;
let onSessionEnded: (() => void) | null = null;

export const setSessionEndedListener = (
	listener: (() => void) | null
): void => {
	onSessionEnded = listener;
};

function setMemoryToken({ idToken: token, expiresIn }: TokenResponse): void {
	idToken = token;
	expiresAt = Date.now() + expiresIn * 1000;
}

async function endSession(): Promise<void> {
	epoch += 1;
	idToken = null;
	expiresAt = 0;
	// ponytail: a failed SecureStore delete is swallowed so sign-out never blocks; memory is already clear.
	await clearRefreshToken().catch(() => {});
}

async function exchangeRefreshToken(): Promise<string> {
	const startedAt = epoch;
	const stored = await getRefreshToken();
	if (!stored) throw new AuthError('invalid-credentials');

	let tokens: TokenResponse;
	try {
		const res = await create<ApiResponse<TokenResponse>>({
			url: AUTH_URL.refresh,
			payload: { refreshToken: stored },
		});
		tokens = res.data;
	} catch (error) {
		const { status } = parseApiError(error);
		if (status === 400 || status === 401) {
			if (startedAt === epoch) {
				await endSession();
				onSessionEnded?.();
			}
			throw new AuthError('invalid-credentials');
		}
		// Offline, timeout, 5xx, 429: keep the stored token so a later attempt can succeed.
		throw new AuthError('network');
	}

	if (startedAt !== epoch) throw new AuthError('invalid-credentials');
	setMemoryToken(tokens);
	await setRefreshToken(tokens.refreshToken);
	return tokens.idToken;
}

/** All callers share one in-flight refresh. */
export function refreshIdToken(): Promise<string> {
	refreshInFlight ??= exchangeRefreshToken().finally(() => {
		refreshInFlight = null;
	});
	return refreshInFlight;
}

async function getValidIdToken(): Promise<string | null> {
	if (!idToken) return null;
	if (expiresAt - Date.now() > REFRESH_MARGIN_MS) return idToken;
	try {
		return await refreshIdToken();
	} catch {
		return idToken; // null if the refresh token was rejected, otherwise let the request try.
	}
}

async function handleUnauthorized(
	error: unknown,
	retried: boolean
): Promise<boolean> {
	if (!idToken) return false; // no established session (e.g. mid sign-in)
	if (retried) {
		await endSession();
		onSessionEnded?.();
		return false;
	}
	const sent = isAxiosError(error)
		? error.config?.headers?.get?.('Authorization')
		: undefined;
	// Another caller already renewed the token since this request left: just replay.
	if (sent && sent !== `Bearer ${idToken}`) return true;
	try {
		await refreshIdToken();
		return true;
	} catch {
		return false;
	}
}

setTokenProvider(getValidIdToken);
setUnauthorizedHandler(handleUnauthorized);

function userFromToken(
	token: string,
	fallback?: TokenIssued['identity']
): AuthUser {
	try {
		const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = decodeURIComponent(
			atob(payload)
				.split('')
				.map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
				.join('')
		);
		// Display-only claims; authorization is always decided by the API.
		const claims = JSON.parse(json) as {
			user_id?: string;
			sub?: string;
			name?: string;
			email?: string;
		};
		return {
			uid: claims.user_id ?? claims.sub ?? fallback?.uid ?? '',
			name: claims.name ?? fallback?.name,
			email: claims.email ?? fallback?.email,
		};
	} catch {
		return {
			uid: fallback?.uid ?? '',
			name: fallback?.name,
			email: fallback?.email,
		};
	}
}

/** Customer gate (E1): by permission membership only. Throws AuthError. */
async function assertCustomer(token: string): Promise<void> {
	let permissions: PermissionsResponse['permissions'];
	try {
		const res = await list<ApiResponse<PermissionsResponse>>({
			url: AUTH_URL.permissions,
			headers: { Authorization: `Bearer ${token}` },
		});
		permissions = res.data.permissions;
	} catch {
		throw new AuthError('verify-failed');
	}
	if (!isCustomerAccount(permissions)) throw new AuthError('not-customer');
}

export async function signInWithPassword(
	email: string,
	password: string
): Promise<AuthUser> {
	let issued: TokenIssued;
	try {
		const res = await create<ApiResponse<TokenIssued>>({
			url: AUTH_URL.token,
			payload: { email, password },
		});
		issued = res.data;
	} catch (error) {
		const { status, fieldErrors } = parseApiError(error);
		if (status === 400) throw new AuthError('validation', fieldErrors);
		if (status === 401) throw new AuthError('invalid-credentials');
		if (status === 429) throw new AuthError('rate-limited');
		throw new AuthError(status === undefined ? 'network' : 'unknown');
	}

	// Nothing is stored until the gate passes, so a staff account leaves no trace on the device.
	await assertCustomer(issued.idToken);

	epoch += 1;
	setMemoryToken(issued);
	await setRefreshToken(issued.refreshToken);
	return userFromToken(issued.idToken, issued.identity);
}

/**
 * Cold-start restore. Resolves the user, or null when signed out (no/rejected token, or a
 * non-customer). Throws AuthError('network' | 'verify-failed') when it could not decide:
 * stored tokens are kept so the caller can offer a retry.
 */
export async function restoreSession(): Promise<AuthUser | null> {
	if (!(await getRefreshToken())) return null;
	let token: string;
	try {
		token = await refreshIdToken();
	} catch (error) {
		if (error instanceof AuthError && error.code === 'invalid-credentials')
			return null;
		throw error;
	}
	try {
		await assertCustomer(token);
	} catch (error) {
		if (error instanceof AuthError && error.code === 'not-customer') {
			await endSession();
			return null;
		}
		idToken = null; // undecided: keep the stored token for the retry, but hold no session in memory.
		throw error;
	}
	return userFromToken(token);
}

/** Best-effort remote logout; local state is cleared first and never depends on the call. */
export async function signOutSession(): Promise<void> {
	// Capture before clearing: a still-valid token is used as is; otherwise the refresh token is read
	// now (endSession deletes it) and exchanged in the background, then used for the logout call.
	const token = idToken;
	const valid = !!token && expiresAt - Date.now() > 0;
	const stored =
		valid || !token ? null : await getRefreshToken().catch(() => null);
	await endSession();
	const revoke = async (bearer: string | null) => {
		if (bearer)
			await create({
				url: AUTH_URL.logout,
				headers: { Authorization: `Bearer ${bearer}` },
			});
	};
	if (valid) revoke(token).catch(() => {});
	else if (stored) {
		// Direct exchange: refreshIdToken() would fail (token already cleared) and must not store anything.
		create<ApiResponse<TokenResponse>>({
			url: AUTH_URL.refresh,
			payload: { refreshToken: stored },
		})
			.then((res) => revoke(res.data.idToken))
			.catch(() => {});
	}
}
