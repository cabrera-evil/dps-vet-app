import {
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

import {
	restoreSession,
	setSessionEndedListener,
	signInWithPassword,
	signOutSession,
} from '@/lib/auth-session';
import { queryClient } from '@/providers/query-client-provider';
import type { AuthStatus, AuthUser } from '@/types/auth';

type AuthSessionContextValue = {
	status: AuthStatus;
	user: AuthUser | null;
	/** True when the cold-start restore could not decide (offline); tokens were kept. */
	restoreFailed: boolean;
	/** Throws AuthError (see lib/auth-session.ts). */
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	retryRestore: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>('loading');
	const [user, setUser] = useState<AuthUser | null>(null);
	const [restoreFailed, setRestoreFailed] = useState(false);

	const endLocally = useCallback(() => {
		setUser(null);
		setStatus('signedOut');
		queryClient.clear();
	}, []);

	const applyRestored = useCallback((restored: AuthUser | null) => {
		setUser(restored);
		setStatus(restored ? 'signedIn' : 'signedOut');
	}, []);

	const applyRestoreFailed = useCallback(() => {
		setUser(null);
		setStatus('signedOut');
		setRestoreFailed(true);
	}, []);

	const retryRestore = useCallback(async () => {
		setRestoreFailed(false);
		await restoreSession().then(applyRestored, applyRestoreFailed);
	}, [applyRestored, applyRestoreFailed]);

	useEffect(() => {
		// Forced sign-out from the REST layer (refresh rejected, or a second 401).
		setSessionEndedListener(endLocally);
		void restoreSession().then(applyRestored, applyRestoreFailed);
		return () => setSessionEndedListener(null);
	}, [endLocally, applyRestored, applyRestoreFailed]);

	const signIn = useCallback(async (email: string, password: string) => {
		const signedIn = await signInWithPassword(email, password);
		setRestoreFailed(false);
		setUser(signedIn);
		setStatus('signedIn');
	}, []);

	const signOut = useCallback(async () => {
		await signOutSession();
		endLocally();
	}, [endLocally]);

	const value = useMemo(
		() => ({ status, user, restoreFailed, signIn, signOut, retryRestore }),
		[status, user, restoreFailed, signIn, signOut, retryRestore]
	);

	return <AuthSessionContext value={value}>{children}</AuthSessionContext>;
}

export function useAuthSession(): AuthSessionContextValue {
	const context = use(AuthSessionContext);
	if (!context)
		throw new Error('useAuthSession must be used within AuthSessionProvider');
	return context;
}
