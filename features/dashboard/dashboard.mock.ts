export type MockAppointment = {
  petName: string;
  service: string;
  dateLabel: string;
  timeLabel: string;
};

export type MockQuickAction = {
  id: string;
  label: string;
  description: string;
};

export const dashboardMock = {
  nextAppointment: {
    petName: "Luna",
    service: "Consulta general",
    dateLabel: "Mañana, 16 de octubre",
    timeLabel: "10:30 a. m.",
  } satisfies MockAppointment,
  quickActions: [
    {
      id: "book",
      label: "Agendar cita",
      description: "Elige el mejor momento para visitarnos.",
    },
    {
      id: "history",
      label: "Ver historial",
      description: "Consulta el cuidado de tus mascotas.",
    },
  ] satisfies MockQuickAction[],
};
