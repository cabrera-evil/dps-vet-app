import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { ClientPlaceholderScreen } from "@/features/dashboard/components/client-placeholder-screen";
import { dashboardMock } from "@/features/dashboard/dashboard.mock";

export default function PetsRoute() {
  return (
    <ClientPlaceholderScreen
      actionLabel="Registrar mascota"
      description="Aquí tendrás a la mano la información esencial de cada compañero."
      title="Mis mascotas"
    >
      {dashboardMock.pets.map((pet) => (
        <View
          key={pet.id}
          className="flex-row items-center rounded-2xl border border-border bg-card p-4"
        >
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <Text className="text-xl">
              {pet.species === "Gato" ? "🐈" : "🐕"}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="font-semibold text-foreground">{pet.name}</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {pet.breed}
            </Text>
          </View>
        </View>
      ))}
    </ClientPlaceholderScreen>
  );
}
