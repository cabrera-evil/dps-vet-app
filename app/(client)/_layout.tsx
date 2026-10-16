import { Stack } from "expo-router";

import { NO_GUTTER_STYLE, SCENE_GUTTER_STYLE } from "@/features/shared/layout";

export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: SCENE_GUTTER_STYLE }}>
      <Stack.Screen name="(tabs)" options={{ contentStyle: NO_GUTTER_STYLE }} />
      <Stack.Screen
        name="appointments/new"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="pets/new" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="pets/[id]/index" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="pets/[id]/edit" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
