import type { ReactNode } from "react";
import { Alert, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ScreenScroll } from "@/features/shared/components/screen-scroll";

type ClientPlaceholderScreenProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  children: ReactNode;
};

export function ClientPlaceholderScreen({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: ClientPlaceholderScreenProps) {
  return (
    <ScreenScroll>
      <Text accessibilityRole="header" className="font-heading text-3xl text-foreground">
        {title}
      </Text>
      <Text className="mt-2 max-w-sm text-base leading-6 text-muted-foreground">
        {description}
      </Text>
      <View className="mt-6 gap-3">{children}</View>
      <Button
        className="mt-8 min-h-12 rounded-lg"
        onPress={
          onAction ??
          (() =>
            Alert.alert(
              "Próximamente",
              `${actionLabel} estará disponible en la siguiente vista.`,
            ))
        }
      >
        <ButtonText className="font-sans-semibold">{actionLabel}</ButtonText>
      </Button>
      <View className="mt-4 flex-row items-center justify-center gap-2">
        <View className="h-2 w-2 rounded-full bg-primary" />
        <Text className="text-center text-sm text-muted-foreground">
          Contenido de vista previa
        </Text>
      </View>
    </ScreenScroll>
  );
}
