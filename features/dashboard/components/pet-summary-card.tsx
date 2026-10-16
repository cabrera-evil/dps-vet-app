import { router } from "expo-router";
import { View } from "react-native";

import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import type { PetAccent } from "@/features/pets/use-pets";
import type { Pet } from "@/types/pet.type";
import { PetSpeciesIcon } from "@/features/pets/components/pet-species-icon";

export function PetSummaryCard({ pet, accent }: { pet: Pet; accent: PetAccent }) {
  const accentClassName =
    accent === "teal"
      ? "bg-secondary text-secondary-foreground"
      : "bg-accent text-accent-foreground";

  return (
    <Pressable
      accessibilityLabel={`Ver ${pet.name}`}
      accessibilityRole="button"
      className="mr-3 w-40 rounded-xl border border-border bg-card p-4 active:bg-muted"
      onPress={() => router.push({ pathname: "/(client)/pets/[id]", params: { id: pet.id } })}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-lg ${accentClassName}`}
      >
        <PetSpeciesIcon species={pet.species} />
      </View>
      <Text className="mt-4 font-heading text-lg text-foreground">
        {pet.name}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">{pet.breed}</Text>
    </Pressable>
  );
}
