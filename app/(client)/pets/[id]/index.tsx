import { useLocalSearchParams } from "expo-router";

import { PetDetail } from "@/features/pets/components/pet-detail";

export default function PetDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PetDetail id={id} />;
}
