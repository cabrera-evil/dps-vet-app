import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { queryClient } from "@/providers/query-client-provider";
import { AuthSessionProvider } from "@/features/auth/auth-session-context";
import { PetPreviewProvider } from "@/features/pets/pet-preview-context";
import { NO_GUTTER_STYLE, SCENE_GUTTER_STYLE } from "@/features/shared/layout";
import { getNavigationTheme } from "@/features/shared/navigation-theme";
import { ThemeModeProvider, useThemeMode } from "@/features/shared/theme-mode";
import { useThemeScheme } from "@/features/shared/use-theme-scheme";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Renders nothing until the saved theme mode is read, so the splash stays up.
  return (
    <ThemeModeProvider>
      <RootNavigator />
    </ThemeModeProvider>
  );
}

function RootNavigator() {
  const colorScheme = useThemeScheme();
  const { mode } = useThemeMode();
  const [loaded, error] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Keep the splash up until fonts resolve; on a load error, render with system fonts.
  if (!loaded && !error) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <PetPreviewProvider>
          <GluestackUIProvider mode={mode}>
            <ThemeProvider
              value={getNavigationTheme(colorScheme)}
            >
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
              <Stack
                screenOptions={{ headerShown: false, contentStyle: SCENE_GUTTER_STYLE }}
              >
                <Stack.Screen name="(client)" options={{ contentStyle: NO_GUTTER_STYLE }} />
              </Stack>
            </ThemeProvider>
          </GluestackUIProvider>
        </PetPreviewProvider>
      </AuthSessionProvider>
    </QueryClientProvider>
  );
}
