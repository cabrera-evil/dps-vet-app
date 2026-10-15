import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { AppointmentStatus } from '@/constants/enum';
import { useDelete, useGet, usePost } from '@/hooks/use-rest';
import { usePets } from '@/features/pets/use-pets';
import type {
	Appointment,
	AppointmentService,
	CreateAppointmentPayload,
} from '@/types/appointment.type';
import type { ApiResponse } from '@/types/rest';

const APPOINTMENTS_URL = '/appointments';
const NO_APPOINTMENTS: Appointment[] = [];
const NO_SERVICES: AppointmentService[] = [];

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
	[AppointmentStatus.PENDING]: 'PENDIENTE',
	[AppointmentStatus.CONFIRMED]: 'CONFIRMADA',
	[AppointmentStatus.ATTENDED]: 'ATENDIDA',
	[AppointmentStatus.CANCELLED]: 'CANCELADA',
	[AppointmentStatus.NO_SHOW]: 'NO ASISTIÓ',
};

export interface AppointmentView extends Appointment {
	petName: string;
	serviceName: string;
	/** Still active and in the future: the only appointments a client can cancel. */
	upcoming: boolean;
}

export function useAppointments() {
	// ponytail: first 100 appointments only (API max pageSize); paginate if a client ever exceeds it.
	const query = useGet<ApiResponse<Appointment[]>>({
		url: APPOINTMENTS_URL,
		params: { page: 1, pageSize: 100 },
	});
	return { ...query, appointments: query.data?.data ?? NO_APPOINTMENTS };
}

export function useServices() {
	const query = useGet<ApiResponse<AppointmentService[]>>(
		{ url: '/services', params: { active: true } },
		{ staleTime: 5 * 60_000 }
	);
	return { ...query, services: query.data?.data ?? NO_SERVICES };
}

/** Appointments joined with pet/service names; upcoming first (soonest first), then history. */
export function useAppointmentViews() {
	const appointmentsQuery = useAppointments();
	const { pets } = usePets();
	const { services } = useServices();
	const { appointments, dataUpdatedAt } = appointmentsQuery;

	const views = useMemo(() => {
		// Query fetch time as "now": keeps the memo pure and refreshes on every refetch.
		const now = dataUpdatedAt;
		const petNames = new Map(pets.map((pet) => [pet.id, pet.name]));
		const serviceNames = new Map(services.map((service) => [service.id, service.name]));
		const all = appointments.map<AppointmentView>((item) => ({
			...item,
			petName: petNames.get(item.petId) ?? 'Tu mascota',
			serviceName: serviceNames.get(item.serviceId) ?? 'Servicio',
			upcoming:
				(item.status === AppointmentStatus.PENDING ||
					item.status === AppointmentStatus.CONFIRMED) &&
				Date.parse(item.start) > now,
		}));
		const upcoming = all
			.filter((item) => item.upcoming)
			.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
		return [...upcoming, ...all.filter((item) => !item.upcoming)];
	}, [appointments, dataUpdatedAt, pets, services]);

	return {
		...appointmentsQuery,
		views,
		nextAppointment: views.find((item) => item.upcoming),
	};
}

function useInvalidateAppointments() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({
			predicate: ({ queryKey }) =>
				(queryKey[1] as { url?: string } | undefined)?.url === APPOINTMENTS_URL,
		});
}

export function useCreateAppointment() {
	const invalidate = useInvalidateAppointments();
	const mutation = usePost<ApiResponse<Appointment>>({ onSuccess: invalidate });
	return {
		createAppointment: (payload: CreateAppointmentPayload) =>
			mutation.mutateAsync({ url: APPOINTMENTS_URL, payload }),
		isPending: mutation.isPending,
	};
}

export function useCancelAppointment() {
	const invalidate = useInvalidateAppointments();
	const mutation = useDelete<unknown>({ onSuccess: invalidate });
	return {
		cancelAppointment: (id: string) =>
			mutation.mutateAsync({ url: `${APPOINTMENTS_URL}/${id}` }),
		isPending: mutation.isPending,
	};
}
