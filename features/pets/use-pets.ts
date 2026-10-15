import { useQueryClient } from '@tanstack/react-query';

import { useGet, usePost } from '@/hooks/use-rest';
import type { ApiResponse } from '@/types/rest';
import type { BreedEntry, CatalogEntry, CreatePetPayload, Pet } from '@/types/pet.type';

const PETS_URL = '/pets';
const NO_PETS: Pet[] = [];

export type PetAccent = 'teal' | 'orange';

/** Accent alternates by list position (the API has no accent). */
export const petAccent = (index: number): PetAccent => (index % 2 === 0 ? 'teal' : 'orange');

export function usePets() {
	// ponytail: first 100 pets only (API max pageSize); paginate if an owner ever exceeds it.
	const query = useGet<ApiResponse<Pet[]>>({ url: PETS_URL, params: { page: 1, pageSize: 100 } });
	return { ...query, pets: query.data?.data ?? NO_PETS };
}

export function useCreatePet() {
	const queryClient = useQueryClient();
	const mutation = usePost<ApiResponse<Pet>>({
		onSuccess: () =>
			queryClient.invalidateQueries({
				predicate: ({ queryKey }) =>
					(queryKey[1] as { url?: string } | undefined)?.url === PETS_URL,
			}),
	});
	return {
		createPet: (payload: CreatePetPayload) => mutation.mutateAsync({ url: PETS_URL, payload }),
		isPending: mutation.isPending,
	};
}

export function useSpecies() {
	const query = useGet<ApiResponse<CatalogEntry[]>>({ url: '/species' }, { staleTime: Infinity });
	return { ...query, species: query.data?.data ?? [] };
}

export function useBreeds(species: string) {
	const query = useGet<ApiResponse<BreedEntry[]>>(
		{ url: '/breeds', params: { species } },
		{ enabled: species.length > 0, staleTime: Infinity }
	);
	return { ...query, breeds: query.data?.data ?? [] };
}
