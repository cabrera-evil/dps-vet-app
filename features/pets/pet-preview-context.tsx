import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  dashboardMock,
  type MockPet,
} from "@/features/dashboard/dashboard.mock";

export type NewMockPetInput = Omit<MockPet, "id" | "accent">;

type PetPreviewContextValue = {
  pets: MockPet[];
  addPet: (input: NewMockPetInput) => void;
};

const PetPreviewContext = createContext<PetPreviewContextValue | null>(null);

export function PetPreviewProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<MockPet[]>(dashboardMock.pets);

  const addPet = useCallback((input: NewMockPetInput) => {
    setPets((current) => [
      ...current,
      {
        ...input,
        id: `preview-${Date.now()}`,
        accent: current.length % 2 === 0 ? "teal" : "orange",
      },
    ]);
  }, []);

  const value = useMemo(() => ({ pets, addPet }), [pets, addPet]);

  return <PetPreviewContext value={value}>{children}</PetPreviewContext>;
}

export function usePetPreview(): PetPreviewContextValue {
  const context = use(PetPreviewContext);
  if (!context)
    throw new Error("usePetPreview must be used within PetPreviewProvider");
  return context;
}
