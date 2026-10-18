import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import {
	APPOINTMENT_STATUS_LABEL,
	useAppointmentViews,
} from '@/features/appointments/use-appointments';
import { requestErrorMessage } from '@/features/auth/validate';
import {
	PetLoadStatus,
	PetLoading,
} from '@/features/pets/components/pet-status-screen';
import {
	useDeletePet,
	usePet,
	usePetClinicalSummary,
} from '@/features/pets/use-pets';
import { FormScreen } from '@/features/shared/components/form-screen';
import { useNotice } from '@/hooks/use-notice';
import { parseApiError } from '@/lib/api-error';
import {
	formatClinicLongDate,
	formatClinicTime,
	formatDate,
} from '@/utils/date';

const sexLabels = { MALE: 'Macho', FEMALE: 'Hembra' } as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<View className="mt-6">
			<Text
				accessibilityRole="header"
				className="mb-3 font-heading text-lg text-foreground"
			>
				{title}
			</Text>
			<View className="gap-2 rounded-xl border border-border bg-card p-4">
				{children}
			</View>
		</View>
	);
}

function Row({ label, value }: { label: string; value?: string }) {
	if (!value) return null;
	return (
		<View className="flex-row justify-between gap-4">
			<Text className="text-sm text-muted-foreground">{label}</Text>
			<Text className="flex-1 text-right text-sm font-sans-medium text-foreground">
				{value}
			</Text>
		</View>
	);
}

function deleteErrorMessage(status?: number) {
	if (status === 404) return 'Esta mascota ya no existe.';
	if (status === 403) return 'No tienes permiso para eliminar esta mascota.';
	if (status === 409)
		return 'No pudimos eliminar la mascota porque tiene registros asociados. Contacta a la clínica.';
	return requestErrorMessage(status);
}

export function PetDetail({ id }: { id: string }) {
	const notify = useNotice();
	const { pet, isPending, error, refetch } = usePet(id);
	const clinical = usePetClinicalSummary(id);
	const { views } = useAppointmentViews();
	const { deletePet, isPending: isDeleting } = useDeletePet(id);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	if (isPending) return <PetLoading title="Mascota" />;
	if (!pet)
		return (
			<PetLoadStatus error={error} onRetry={() => refetch()} title="Mascota" />
		);

	const summary = clinical.summary;
	const upcoming = views.filter((item) => item.petId === id && item.upcoming);
	const lastWeight = summary?.weightHistory[0];

	const handleDelete = async () => {
		setDeleteError(null);
		try {
			await deletePet();
		} catch (cause) {
			const { status } = parseApiError(cause);
			if (status !== 404) {
				setDeleteError(deleteErrorMessage(status));
				return;
			}
		}
		notify('Mascota eliminada', `${pet.name} ya no aparece en tu lista.`);
		router.back();
	};

	return (
		<FormScreen
			backLabel="Volver"
			subtitle={pet.breed ? `${pet.species} · ${pet.breed}` : pet.species}
			title={pet.name}
		>
			<Section title="Datos">
				<Row label="Especie" value={pet.species} />
				<Row label="Raza" value={pet.breed} />
				<Row label="Nacimiento" value={formatDate(pet.birthDate)} />
				<Row label="Sexo" value={pet.sex ? sexLabels[pet.sex] : undefined} />
				<Row
					label="Esterilizado"
					value={
						pet.sterilized === undefined
							? undefined
							: pet.sterilized
								? 'Sí'
								: 'No'
					}
				/>
				<Row label="Color" value={pet.color} />
				<Row label="Microchip" value={pet.microchip} />
				<Row label="Señas" value={pet.markings} />
				<Row label="Notas" value={pet.notes} />
			</Section>

			<Section title="Próximas citas">
				{upcoming.length === 0 ? (
					<Text className="text-sm text-muted-foreground">
						No tiene citas próximas.
					</Text>
				) : (
					upcoming.map((item) => (
						<View key={item.id}>
							<Text className="font-sans-semibold text-foreground">
								{item.serviceName}
							</Text>
							<Text className="text-sm text-muted-foreground">
								{formatClinicLongDate(item.start)} ·{' '}
								{formatClinicTime(item.start)} ·{' '}
								{APPOINTMENT_STATUS_LABEL[item.status]}
							</Text>
						</View>
					))
				)}
			</Section>

			<Section title="Historial clínico">
				{clinical.isPending ? (
					<Spinner accessibilityLabel="Cargando historial clínico" />
				) : clinical.isError || !summary ? (
					<Text
						className="text-sm text-muted-foreground"
						onPress={() => clinical.refetch()}
					>
						No pudimos cargar el historial. Toca para reintentar.
					</Text>
				) : (
					<>
						<Row label="Expediente" value={summary.recordNumber} />
						<Row
							label="Último peso"
							value={
								lastWeight
									? `${lastWeight.valueKg} kg (${formatDate(lastWeight.measuredAt)})`
									: undefined
							}
						/>
						<Row
							label="Próximo control"
							value={
								summary.nextFollowUp
									? `${formatDate(summary.nextFollowUp.recommendedDate)} · ${summary.nextFollowUp.reason}`
									: undefined
							}
						/>
						{summary.alerts.map((alert) => (
							<Text key={alert.id} className="text-sm text-destructive">
								Alerta: {alert.title}
							</Text>
						))}
						{summary.activeProblems.map((problem) => (
							<Text key={problem.id} className="text-sm text-foreground">
								{problem.name} ({problem.statusLabel})
							</Text>
						))}
						{summary.currentMedications.map((medication) => (
							<Text key={medication.id} className="text-sm text-foreground">
								{medication.name}: {medication.instructions}
							</Text>
						))}
						{!lastWeight &&
						!summary.nextFollowUp &&
						!summary.alerts.length &&
						!summary.activeProblems.length &&
						!summary.currentMedications.length ? (
							<Text className="text-sm text-muted-foreground">
								Aún no hay registros clínicos.
							</Text>
						) : null}
					</>
				)}
			</Section>

			<Button
				className="mt-8 min-h-12 rounded-lg"
				onPress={() =>
					router.push({ pathname: '/(client)/pets/[id]/edit', params: { id } })
				}
			>
				<ButtonText className="font-sans-semibold">Editar mascota</ButtonText>
			</Button>
			<Button
				accessibilityState={{ busy: isDeleting, disabled: isDeleting }}
				className="mt-3 min-h-12 rounded-lg"
				disabled={isDeleting}
				onPress={() => setConfirmOpen(true)}
				variant="outline"
			>
				<ButtonText className="font-sans-semibold text-destructive">
					{isDeleting ? 'Eliminando...' : 'Eliminar mascota'}
				</ButtonText>
			</Button>
			{deleteError ? (
				<Text
					accessibilityRole="alert"
					className="mt-3 text-sm text-destructive"
				>
					{deleteError}
				</Text>
			) : null}

			<ConfirmDialog
				cancelLabel="Cancelar"
				confirmLabel="Eliminar"
				destructive
				isOpen={confirmOpen}
				message={`Se eliminará a ${pet.name} de tu lista y se cancelarán sus citas próximas. Esta acción no se puede deshacer.`}
				onClose={() => setConfirmOpen(false)}
				onConfirm={handleDelete}
				title="¿Eliminar mascota?"
			/>
		</FormScreen>
	);
}
