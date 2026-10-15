import { View } from "react-native";

import { Text } from "@/components/ui/text";
import type { MockPet } from "@/features/dashboard/dashboard.mock";
import { PetSpeciesIcon } from "@/features/pets/components/pet-species-icon";

export function PetSummaryCard({ pet }: { pet: MockPet }) {
  const accentClassName =
    pet.accent === "teal"
      ? "bg-secondary text-secondary-foreground"
      : "bg-accent text-accent-foreground";

  return (
    <View className="mr-3 w-40 rounded-xl border border-border bg-card p-4">
      <View
        className={`h-12 w-12 items-center justify-center rounded-lg ${accentClassName}`}
      >
        <PetSpeciesIcon species={pet.species} />
      </View>
      <Text className="mt-4 font-heading text-lg text-foreground">
        {pet.name}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">{pet.breed}</Text>
    </View>
  );
}
