import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardScreen } from "@/features/shared/components/keyboard-screen";
import { DecorativeIcon } from "@/features/shared/components/decorative-icon";
import { SCREEN_GUTTER } from "@/features/shared/layout";
import { Text } from "@/components/ui/text";
import { ChevronLeft } from "lucide-react-native";

type FormScreenProps = {
  title: string;
  subtitle: string;
  backLabel: string;
  children: ReactNode;
};

// Pushed form screen: safe-area header with back button, keyboard-safe scroller.
export function FormScreen({
  title,
  subtitle,
  backLabel,
  children,
}: FormScreenProps) {
  const insets = useSafeAreaInsets();

  const header = (
    <View
      className="flex-row items-center border-b border-border bg-card pb-4"
      style={{
        marginHorizontal: -SCREEN_GUTTER,
        paddingHorizontal: SCREEN_GUTTER - 8,
        paddingTop: insets.top + 16,
      }}
    >
      <Pressable
        accessibilityLabel={backLabel}
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full active:bg-muted"
        onPress={() => router.back()}
      >
        <DecorativeIcon
          as={ChevronLeft}
          className="text-foreground"
          size="xl"
        />
      </Pressable>
      <View className="ml-2 flex-1">
        <Text accessibilityRole="header" className="font-heading text-xl text-foreground">
          {title}
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardScreen contentContainerStyle={{ paddingTop: 24 }} header={header}>
      {children}
    </KeyboardScreen>
  );
}
