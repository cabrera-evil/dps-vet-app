import { Cat, Dog, PawPrint } from "lucide-react-native";

import { DecorativeIcon } from "@/features/shared/components/decorative-icon";

const speciesIcon = (species: string) =>
  species === "Gato" ? Cat : species === "Perro" || species === "Perra" ? Dog : PawPrint;

// Decorative: the species is always shown as text next to the icon.
export function PetSpeciesIcon({ species, className }: { species: string; className?: string }) {
  return (
    <DecorativeIcon
      as={speciesIcon(species)}
      className={className ?? "text-primary"}
      size="xl"
    />
  );
}
