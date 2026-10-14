import { View } from "react-native";

import { Text } from "@/components/ui/text";

export function LoginVisual() {
  return (
    <View accessibilityElementsHidden className="items-center py-7">
      <View className="h-28 w-28 items-center justify-center rounded-full bg-secondary">
        <View className="relative h-16 w-16">
          <View className="absolute left-1 h-5 w-5 rounded-full bg-primary" />
          <View className="absolute right-1 h-5 w-5 rounded-full bg-primary" />
          <View className="absolute left-3 top-5 h-5 w-5 rounded-full bg-primary" />
          <View className="absolute right-3 top-5 h-5 w-5 rounded-full bg-primary" />
          <View className="absolute bottom-0 left-3 h-9 w-10 rounded-[18px] bg-primary" />
        </View>
      </View>
      <Text className="mt-4 font-heading text-2xl text-foreground">
        San Roque
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        Tu veterinaria de confianza
      </Text>
    </View>
  );
}
