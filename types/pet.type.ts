import type { PetSex } from '@/constants/enum';

export interface Pet {
	id: string;
	ownerId: string;
	name: string;
	species: string;
	breed?: string;
	birthDate: string;
	notes?: string;
	sex?: PetSex;
	sterilized?: boolean;
	color?: string;
	markings?: string;
	microchip?: string;
	createdAt: string;
}

/** POST /pets body for a client: `ownerId` and `weightKg` are never sent. */
export interface CreatePetPayload {
	name: string;
	species: string;
	breed?: string;
	birthDate: string;
	notes?: string;
	sex?: `${PetSex}`;
	sterilized: boolean;
	color?: string;
	markings?: string;
	microchip?: string;
}

/** Species / breed catalog entries (`GET /species`, `GET /breeds`). */
export interface CatalogEntry {
	id: string;
	name: string;
}

export interface BreedEntry extends CatalogEntry {
	species: string;
}

/** PATCH /pets/:id body: at least one changed field; `ownerId` and `weightKg` are never sent. */
export type UpdatePetPayload = Partial<CreatePetPayload>;

/** GET /pets/:id/clinical-summary (owner-readable subset; owner contact and last consultation omitted). */
export interface PetClinicalSummary {
	recordNumber?: string;
	alerts: { id: string; title: string; detail?: string }[];
	activeProblems: { id: string; name: string; statusLabel: string }[];
	weightHistory: { valueKg: number; measuredAt: string }[];
	currentMedications: { id: string; name: string; instructions: string }[];
	nextFollowUp?: { id: string; recommendedDate: string; reason: string };
}
