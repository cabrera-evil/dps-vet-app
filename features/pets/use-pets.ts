import { useQueryClient } from '@tanstack/react-query';

import { useDelete, useGet, usePatch, usePost } from '@/hooks/use-rest';
import type { ApiResponse } from '@/types/rest';
import type {
	BreedEntry,
	CatalogEntry,
	CreatePetPayload,
	Pet,
	PetClinicalSummary,
	UpdatePetPayload,
} from '@/types/pet.type';

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

const requestUrl = (queryKey: readonly unknown[]) =>
	(queryKey[1] as { url?: string } | undefined)?.url;

/** Refetches every pets query (list, detail, clinical summary) after a mutation. */
function useInvalidatePets() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({
			predicate: ({ queryKey }) => requestUrl(queryKey)?.startsWith(PETS_URL) ?? false,
		});
}

export function useCreatePet() {
	const invalidate = useInvalidatePets();
	const mutation = usePost<ApiResponse<Pet>>({ onSuccess: invalidate });
	return {
		createPet: (payload: CreatePetPayload) => mutation.mutateAsync({ url: PETS_URL, payload }),
		isPending: mutation.isPending,
	};
}

export function usePet(id: string) {
	const query = useGet<ApiResponse<Pet>>({ url: `${PETS_URL}/${id}` }, { enabled: id.length > 0 });
	return { ...query, pet: query.data?.data };
}

/** Owner-readable clinical summary (CLIENTE has MEDICAL_RECORDS_READ); optional on screens. */
export function usePetClinicalSummary(id: string) {
	const query = useGet<ApiResponse<PetClinicalSummary>>(
		{ url: `${PETS_URL}/${id}/clinical-summary` },
		{ enabled: id.length > 0 }
	);
	return { ...query, summary: query.data?.data };
}

export function useUpdatePet(id: string) {
	const invalidate = useInvalidatePets();
	const mutation = usePatch<ApiResponse<Pet>>({ onSuccess: invalidate });
	return {
		updatePet: (payload: UpdatePetPayload) =>
			mutation.mutateAsync({ url: `${PETS_URL}/${id}`, payload }),
		isPending: mutation.isPending,
	};
}

export function useDeletePet(id: string) {
	const queryClient = useQueryClient();
	const invalidate = useInvalidatePets();
	const mutation = useDelete<unknown>({
		onSuccess: () => {
			// Drop the deleted pet's own queries first so the open detail screen never refetches a 404.
			queryClient.removeQueries({
				predicate: ({ queryKey }) => requestUrl(queryKey)?.startsWith(`${PETS_URL}/${id}`) ?? false,
			});
			// Appointments reference the pet (names fall back to "Tu mascota"), so refresh them too.
			queryClient.invalidateQueries({
				predicate: ({ queryKey }) => requestUrl(queryKey)?.startsWith('/appointments') ?? false,
			});
			return invalidate();
		},
	});
	return {
		deletePet: () => mutation.mutateAsync({ url: `${PETS_URL}/${id}` }),
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
