import { useState } from "react";
import { z } from "zod";

import { formatIsoDateInput } from "@/utils/date";

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

  const updateDate = (value: string) => {
    updateValue("date", formatIsoDateInput(value));
  };

  const submit = (): AppointmentFormValues | null => {
    const parsed = appointmentFormSchema.safeParse(values);
    if (parsed.success) return parsed.data;

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
    updateDate,
    updateValue,
    values,
  };
}
