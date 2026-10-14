import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

type DashboardSectionProps = {
  title: string;
  actionLabel?: string;
  children: ReactNode;
};

export function DashboardSection({
  title,
  actionLabel,
  children,
}: DashboardSectionProps) {
  return (
    <View className="mt-8">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-heading text-xl text-foreground">{title}</Text>
        {actionLabel ? (
          <Text className="text-sm font-semibold text-primary">
            {actionLabel}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}
