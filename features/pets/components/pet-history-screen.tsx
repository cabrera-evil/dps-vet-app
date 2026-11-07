import { useState } from 'react';
import { View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { requestErrorMessage } from '@/features/auth/validate';
import {
	PetLoadStatus,
	PetLoading,
} from '@/features/pets/components/pet-status-screen';
import {
	ENCOUNTERS_PAGE_SIZE,
	usePet,
	usePetEncounters,
} from '@/features/pets/use-pets';
import { FormScreen } from '@/features/shared/components/form-screen';
import { parseApiError } from '@/lib/api-error';
import type { PetEncounter } from '@/types/pet.type';
import { formatDate } from '@/utils/date';

const TYPE_LABEL: Record<string, string> = { CONSULTATION: 'Consulta' };

const KIND_LABEL: Record<string, string> = {
	GENERAL: 'General',
	PREVENTIVE: 'Preventiva',
	DERMATOLOGICAL: 'Dermatológica',
	DIGESTIVE: 'Digestiva',
	RESPIRATORY: 'Respiratoria',
	OTHER: 'Otra',
};

function EncounterRow({ item }: { item: PetEncounter }) {
	return (
		<View className="gap-1 rounded-xl border border-border bg-card p-4">
			<View className="flex-row items-center justify-between gap-2">
				<Text className="font-sans-semibold text-foreground">
					{formatDate(item.occurredAt)}
				</Text>
				{item.requiresFollowUp ? (
					<View className="rounded-full bg-secondary px-3 py-1">
						<Text className="text-xs font-sans-semibold text-primary">
							Requiere seguimiento
						</Text>
					</View>
				) : null}
			</View>
			<Text className="text-sm text-foreground">
				{TYPE_LABEL[item.type] ?? item.type}
				{item.kind ? ` · ${KIND_LABEL[item.kind] ?? item.kind}` : ''}
			</Text>
			{item.reason ? (
				<Text className="text-sm text-muted-foreground">
					Motivo: {item.reason}
				</Text>
			) : null}
			{item.mainDiagnosis ? (
				<Text className="text-sm text-muted-foreground">
					Diagnóstico: {item.mainDiagnosis}
				</Text>
			) : null}
			<Text className="text-sm text-muted-foreground">
				Atendió: {item.staffName}
			</Text>
		</View>
	);
}

type PageProps = {
	id: string;
	page: number;
	isLast: boolean;
	onMore: () => void;
};

/** Renders one fetched page; pages are cached per key so rerenders never duplicate rows. */
function EncounterPage({ id, page, isLast, onMore }: PageProps) {
	const { encounters, total, isPending, isError, refetch } = usePetEncounters(
		id,
		page
	);
	if (isPending) return <Spinner accessibilityLabel="Cargando más visitas" />;
	if (isError)
		return (
			<Button
				className="min-h-12 rounded-lg"
				onPress={() => refetch()}
				variant="outline"
			>
				<ButtonText>No pudimos cargar más visitas. Reintentar</ButtonText>
			</Button>
		);
	return (
		<>
			{encounters.map((item) => (
				<EncounterRow key={item.id} item={item} />
			))}
			{isLast && page * ENCOUNTERS_PAGE_SIZE < total ? (
				<Button
					accessibilityLabel="Cargar más"
					className="min-h-12 rounded-lg"
					onPress={onMore}
					variant="outline"
				>
					<ButtonText>Cargar más</ButtonText>
				</Button>
			) : null}
		</>
	);
}

export function PetHistoryScreen({ id }: { id: string }) {
	const {
		pet,
		isPending: petPending,
		error: petError,
		refetch: refetchPet,
	} = usePet(id);
	const first = usePetEncounters(id, 1);
	const [pages, setPages] = useState(1);

	if (petPending) return <PetLoading title="Historial" />;
	if (!pet)
		return (
			<PetLoadStatus
				error={petError}
				onRetry={() => refetchPet()}
				title="Historial"
			/>
		);

	const subtitle = `Historial clínico · ${pet.name}`;

	if (first.isPending)
		return (
			<FormScreen backLabel="Volver" subtitle={subtitle} title="Historial">
				<Spinner accessibilityLabel="Cargando historial" />
			</FormScreen>
		);

	if (first.isError && !first.data) {
		const { status } = parseApiError(first.error);
		const notFound = status === 404;
		return (
			<FormScreen backLabel="Volver" subtitle={subtitle} title="Historial">
				<View className="rounded-xl border border-dashed border-border bg-card p-6">
					<Text className="text-center text-muted-foreground">
						{notFound
							? 'No encontramos el historial de esta mascota.'
							: requestErrorMessage(status)}
					</Text>
					{notFound ? null : (
						<Button
							className="mt-4 min-h-12 rounded-lg"
							onPress={() => first.refetch()}
							variant="outline"
						>
							<ButtonText>Reintentar</ButtonText>
						</Button>
					)}
				</View>
			</FormScreen>
		);
	}

	return (
		<FormScreen backLabel="Volver" subtitle={subtitle} title="Historial">
			{first.encounters.length === 0 ? (
				<View className="rounded-xl border border-dashed border-border bg-card p-6">
					<Text className="text-center text-muted-foreground">
						Aún no hay visitas finalizadas en el historial.
					</Text>
				</View>
			) : (
				<View className="gap-3">
					{Array.from({ length: pages }, (_, index) => (
						<EncounterPage
							key={index}
							id={id}
							isLast={index + 1 === pages}
							onMore={() => setPages((count) => count + 1)}
							page={index + 1}
						/>
					))}
				</View>
			)}
		</FormScreen>
	);
}
