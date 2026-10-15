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
