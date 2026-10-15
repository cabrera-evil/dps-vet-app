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
