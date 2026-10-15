import { router } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { ClientPlaceholderScreen } from "@/features/dashboard/components/client-placeholder-screen";
import { PetSpeciesIcon } from "@/features/pets/components/pet-species-icon";
import { usePetPreview } from "@/features/pets/pet-preview-context";

export default function PetsRoute() {
  const { pets } = usePetPreview();

  return (
    <ClientPlaceholderScreen
      actionLabel="Registrar mascota"
      description="Aquí tendrás a la mano la información esencial de cada compañero."
      onAction={() => router.push("/(client)/pets/new")}
      title="Mis mascotas"
    >
      {pets.length === 0 ? (
        <View className="items-center rounded-xl border border-dashed border-border bg-card p-6">
          <Text className="text-center text-muted-foreground">
            Aún no tienes mascotas registradas.
          </Text>
        </View>
      ) : null}
      {pets.map((pet) => (
        <View
          key={pet.id}
          className="flex-row items-center rounded-xl border border-border bg-card p-4"
        >
          <View className="h-12 w-12 items-center justify-center rounded-lg bg-secondary">
            <PetSpeciesIcon species={pet.species} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-sans-semibold text-foreground">{pet.name}</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {pet.breed}
            </Text>
          </View>
        </View>
      ))}
    </ClientPlaceholderScreen>
  );
}
