export const petCatalog = [
  { species: "Perro", breeds: ["Golden retriever", "Labrador", "Pastor alemán", "Mestizo"] },
  { species: "Gato", breeds: ["Siamés", "Persa", "Mestizo"] },
  { species: "Ave", breeds: [] },
  { species: "Otro", breeds: [] },
] as const;

export const petSexOptions = [
  { label: "Macho", value: "MALE" },
  { label: "Hembra", value: "FEMALE" },
] as const;

export const getBreedsForSpecies = (species: string) =>
  petCatalog.find((entry) => entry.species === species)?.breeds ?? [];
