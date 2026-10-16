import { useLocalSearchParams } from "expo-router";

import { EditPetScreen } from "@/features/pets/components/edit-pet-screen";

export default function EditPetRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditPetScreen id={id} />;
}
