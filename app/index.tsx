import { Redirect } from "expo-router";

import { useAuthSession } from "@/features/auth/auth-session-context";

// Anchor route: protected-route redirects land here, then forward to the right group.
export default function IndexRoute() {
  const { status } = useAuthSession();

  if (status === "loading") return null;
  return <Redirect href={status === "signedIn" ? "/(client)/(tabs)" : "/(auth)/login"} />;
}
