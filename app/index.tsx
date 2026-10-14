import { Redirect } from "expo-router";

import { useAuthSession } from "@/features/auth/auth-session-context";

export default function IndexRoute() {
  const { session } = useAuthSession();

  return <Redirect href={session ? "/(client)/(tabs)" : "/(auth)/login"} />;
}
