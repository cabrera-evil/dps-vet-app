import type { Permission } from '@/constants/permission';

export interface TokenResponse {
	idToken: string;
	refreshToken: string;
	/** Seconds until the idToken expires. */
	expiresIn: number;
}

export interface TokenIssued extends TokenResponse {
	identity?: { uid: string; email?: string; name?: string };
}

export interface PermissionsResponse {
	permissions: Permission[];
}

export interface AuthUser {
	uid: string;
	name?: string;
	email?: string;
}

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';
