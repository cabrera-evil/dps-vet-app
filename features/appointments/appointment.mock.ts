export type AppointmentService = {
  id: string;
  label: string;
};

export const appointmentServices: readonly AppointmentService[] = [
  { id: "general-consultation", label: "Consulta general" },
  { id: "vaccination", label: "Vacunación" },
  { id: "grooming", label: "Baño y estética" },
  { id: "follow-up", label: "Seguimiento" },
];

export const appointmentTimeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
] as const;
