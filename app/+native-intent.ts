/**
 * The Google OAuth redirect (`<applicationId>:/oauthredirect?code=...`) is consumed by
 * expo-auth-session, not by a screen. Without this, the router renders "Unmatched Route".
 */
export function redirectSystemPath({
	path,
}: {
	path: string;
	initial: boolean;
}) {
	return path.includes('oauthredirect') ? '/' : path;
}
