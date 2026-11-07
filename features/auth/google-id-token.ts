import {
	AccessTokenRequest,
	AuthRequest,
	makeRedirectUri,
	Prompt,
	ResponseType,
	type DiscoveryDocument,
} from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { AuthError } from '@/lib/auth-session';
import { getGoogleClientId } from '@/lib/env';

// Closes the popup on web; a no-op on native.
WebBrowser.maybeCompleteAuthSession();

const discovery: DiscoveryDocument = {
	authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
	tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

/**
 * Browser-based Google sign-in that yields a Google ID token for POST /auth/google.
 * Native: authorization code + PKCE (no client secret), exchanged at Google's token endpoint.
 * Web: implicit `id_token` response (Web client IDs cannot exchange a code without a secret).
 * Resolves null when the user dismisses the consent screen. Throws AuthError otherwise.
 */
export async function getGoogleIdToken(): Promise<string | null> {
	const clientId = getGoogleClientId();
	// Native Google clients only accept `<applicationId>:/oauthredirect`; Expo registers that scheme.
	const appId =
		Platform.OS === 'ios'
			? Constants.expoConfig?.ios?.bundleIdentifier
			: Constants.expoConfig?.android?.package;
	const isWeb = Platform.OS === 'web';
	if (!clientId || (!isWeb && !appId))
		throw new AuthError('google-unavailable');

	try {
		const redirectUri = makeRedirectUri({ native: `${appId}:/oauthredirect` });
		const request = new AuthRequest({
			clientId,
			redirectUri,
			scopes: ['openid', 'email', 'profile'],
			prompt: Prompt.SelectAccount,
			responseType: isWeb ? ResponseType.IdToken : ResponseType.Code,
			usePKCE: !isWeb,
			extraParams: isWeb ? { nonce: Crypto.randomUUID() } : undefined,
		});
		const result = await request.promptAsync(discovery);
		if (result.type === 'error') throw new AuthError('unknown');
		if (result.type !== 'success') return null; // cancel / dismiss / locked: back to the login screen.

		const tokens = isWeb
			? { idToken: result.params.id_token }
			: await new AccessTokenRequest({
					clientId,
					redirectUri,
					code: result.params.code,
					extraParams: { code_verifier: request.codeVerifier ?? '' },
				}).performAsync(discovery);
		if (!tokens.idToken) throw new AuthError('unknown');
		return tokens.idToken;
	} catch (error) {
		if (error instanceof AuthError) throw error;
		// fetch rejects with a TypeError when Google is unreachable; never surface raw provider text.
		throw new AuthError(error instanceof TypeError ? 'network' : 'unknown');
	}
}
