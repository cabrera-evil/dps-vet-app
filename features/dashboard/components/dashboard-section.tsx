import type { ReactNode } from "react";
import { View } from "react-native";

import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";

type DashboardSectionProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: ReactNode;
};

export function DashboardSection({
  title,
  actionLabel,
  onActionPress,
  children,
}: DashboardSectionProps) {
  return (
    <View className="mt-6">
      <View className="mb-4 min-h-11 flex-row items-center justify-between">
        <Text accessibilityRole="header" className="font-heading text-xl text-foreground">
          {title}
        </Text>
        {actionLabel ? (
          <Pressable
            accessibilityRole="link"
            className="min-h-11 justify-center pl-4 active:opacity-70"
            onPress={onActionPress}
          >
            <Text className="text-sm font-sans-semibold text-primary">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
