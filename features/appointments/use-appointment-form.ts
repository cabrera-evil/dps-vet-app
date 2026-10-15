import { useState } from "react";
import { z } from "zod";

import type { CreateAppointmentPayload } from "@/types/appointment.type";
import { clinicNow, clinicStartIso } from "@/utils/date";

export type AppointmentPicker = "pet" | "service" | "time" | null;

type AppointmentFormValues = {
  petId: string;
  serviceId: string;
  date: string;
  time: string;
};

type AppointmentField = keyof AppointmentFormValues;
type AppointmentFormErrors = Partial<Record<AppointmentField, string>>;

const appointmentFormSchema = z.object({
  petId: z.string().min(1, "Selecciona una mascota"),
  serviceId: z.string().min(1, "Selecciona un servicio"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato AAAA-MM-DD"),
  time: z.string().min(1, "Selecciona una hora"),
});

// No availability endpoint: fixed clinic-local slots; the API answers 409 when one is taken.
const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] as const;

/** Slots for a date, without the ones already past when the date is today (clinic time). */
export function availableTimeSlots(date: string): string[] {
  const now = clinicNow();
  return TIME_SLOTS.filter((slot) => date !== now.date || slot > now.time);
}

const initialValues: AppointmentFormValues = {
  petId: "",
  serviceId: "",
  date: "",
  time: "",
};

export function useAppointmentForm() {
  const [values, setValues] = useState<AppointmentFormValues>(initialValues);
  const [errors, setErrors] = useState<AppointmentFormErrors>({});
  const [activePicker, setActivePicker] = useState<AppointmentPicker>(null);

  const updateValue = <Field extends AppointmentField>(
    field: Field,
    value: AppointmentFormValues[Field],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (): CreateAppointmentPayload | null => {
    const parsed = appointmentFormSchema.safeParse(values);
    if (parsed.success) {
      const { petId, serviceId, date, time } = parsed.data;
      const start = clinicStartIso(date, time);
      if (!start) {
        setErrors({ date: "La fecha no es válida" });
        return null;
      }
      if (Date.parse(start) <= Date.now()) {
        setErrors({ date: "Elige una fecha y hora futuras" });
        return null;
      }
      return { petId, serviceId, start };
    }

    const nextErrors: AppointmentFormErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") {
        nextErrors[field as AppointmentField] = issue.message;
      }
    }
    setErrors(nextErrors);
    return null;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setActivePicker(null);
  };

  return {
    activePicker,
    errors,
    reset,
    setActivePicker,
    submit,
    updateValue,
    values,
  };
}
