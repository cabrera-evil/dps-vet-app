import { NunitoSans_400Regular } from "@expo-google-fonts/nunito-sans";
import { VarelaRound_400Regular } from "@expo-google-fonts/varela-round";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { queryClient } from "@/providers/query-client-provider";
import { AuthSessionProvider } from "@/features/auth/auth-session-context";
import { PetPreviewProvider } from "@/features/pets/pet-preview-context";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    NunitoSans_400Regular,
    VarelaRound_400Regular,
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
          <GluestackUIProvider mode="system">
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
          </GluestackUIProvider>
        </PetPreviewProvider>
      </AuthSessionProvider>
    </QueryClientProvider>
  );
}
