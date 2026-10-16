import { PetForm } from "@/features/pets/components/pet-form";
import { PetLoadStatus, PetLoading } from "@/features/pets/components/pet-status-screen";
import { usePet } from "@/features/pets/use-pets";

/** Waits for the stored pet so the form is prefilled once, then renders it in edit mode. */
export function EditPetScreen({ id }: { id: string }) {
  const { pet, isPending, error, refetch } = usePet(id);

  if (isPending) return <PetLoading title="Editar mascota" />;
  if (!pet) return <PetLoadStatus error={error} onRetry={() => refetch()} title="Editar mascota" />;
  return <PetForm pet={pet} />;
}
