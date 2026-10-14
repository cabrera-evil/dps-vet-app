import type { ReactNode } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";

type ClientPlaceholderScreenProps = {
  title: string;
  description: string;
  actionLabel: string;
  children: ReactNode;
};

export function ClientPlaceholderScreen({
  title,
  description,
  actionLabel,
  children,
}: ClientPlaceholderScreenProps) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-10 pt-7"
    >
      <Text className="font-heading text-3xl text-foreground">{title}</Text>
      <Text className="mt-2 max-w-sm text-base leading-6 text-muted-foreground">
        {description}
      </Text>
      <View className="mt-8 gap-3">{children}</View>
      <Pressable
        accessibilityLabel={`${actionLabel}, próximamente`}
        className="mt-8 min-h-13 items-center justify-center rounded-2xl bg-primary px-5"
        onPress={() =>
          Alert.alert(
            "Próximamente",
            `${actionLabel} estará disponible en la siguiente vista.`,
          )
        }
      >
        <Text className="font-semibold text-primary-foreground">
          {actionLabel}
        </Text>
      </Pressable>
      <View className="mt-4 flex-row items-center justify-center gap-2">
        <View className="h-2 w-2 rounded-full bg-accent" />
        <Text className="text-center text-sm text-muted-foreground">
          Contenido de vista previa
        </Text>
      </View>
    </ScrollView>
  );
}
