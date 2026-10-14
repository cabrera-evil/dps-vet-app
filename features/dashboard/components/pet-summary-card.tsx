import { View } from "react-native";

import { Text } from "@/components/ui/text";
import type { MockPet } from "@/features/dashboard/dashboard.mock";

export function PetSummaryCard({ pet }: { pet: MockPet }) {
  const accentClassName =
    pet.accent === "teal"
      ? "bg-secondary text-secondary-foreground"
      : "bg-orange-100 text-orange-800";

  return (
    <View className="mr-3 w-40 rounded-2xl border border-border bg-card p-4">
      <View
        className={`h-11 w-11 items-center justify-center rounded-2xl ${accentClassName}`}
      >
        <Text className="text-lg">{pet.species === "Gato" ? "🐈" : "🐕"}</Text>
      </View>
      <Text className="mt-4 font-heading text-lg text-foreground">
        {pet.name}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">{pet.breed}</Text>
    </View>
  );
}
