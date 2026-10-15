import * as SecureStore from 'expo-secure-store';

// Only the long-lived refresh token is persisted. The idToken lives in memory (lib/auth-session.ts).
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string) =>
	SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
export const clearRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
