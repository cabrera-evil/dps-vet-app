export type MockQuickAction = {
	id: string;
	label: string;
	description: string;
};

export const dashboardMock = {
	quickActions: [
		{
			id: 'book',
			label: 'Agendar cita',
			description: 'Elige el mejor momento para visitarnos.',
		},
		{
			id: 'history',
			label: 'Ver historial',
			description: 'Consulta el cuidado de tus mascotas.',
		},
	] satisfies MockQuickAction[],
};
