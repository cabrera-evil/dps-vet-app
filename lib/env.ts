import { Platform } from 'react-native';

/** Base URL of the dps-vet-web API (its `app/api` routes). Fails loudly when unset. */
export function getApiBaseUrl(): string {
	// Expo inlines EXPO_PUBLIC_* only for static `process.env.NAME` access.
	const url = process.env.EXPO_PUBLIC_API_URL;
	if (!url) {
		throw new Error(
			'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set the API base URL.'
		);
	}
	return url;
}

/**
 * OAuth client ID for Google sign-in on this platform, or undefined when not configured
 * (the login screen then hides the Google option). Public identifier, not a secret.
 */
export function getGoogleClientId(): string | undefined {
	// Static `process.env.NAME` access: Expo only inlines EXPO_PUBLIC_* that way.
	return (
		Platform.select({
			ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
			android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
			default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
		}) || undefined
	);
}
