import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { useNotice } from "@/hooks/use-notice";
import { OptionPicker } from "@/components/option-picker";
import { Button, ButtonText } from "@/components/ui/button";
import { DateField } from "@/components/custom/date-field";
import { Text } from "@/components/ui/text";
import { availableTimeSlots, useAppointmentForm } from "@/features/appointments/use-appointment-form";
import { useCreateAppointment, useServices } from "@/features/appointments/use-appointments";
import { requestErrorMessage } from "@/features/auth/validate";
import { usePets } from "@/features/pets/use-pets";
import { parseApiError } from "@/lib/api-error";
import { clinicNow, fromIsoDate } from "@/utils/date";
import { FormScreen } from "@/features/shared/components/form-screen";

import { AppointmentSelectField } from "./appointment-select-field";

export function NewAppointmentForm() {
  const { pets, isPending: petsLoading, isError: petsError } = usePets();
  const {
    services,
    isPending: servicesLoading,
    isError: servicesError,
  } = useServices();
  const { createAppointment, isPending: submitting } = useCreateAppointment();
  const form = useAppointmentForm();
  const notify = useNotice();
  const [formError, setFormError] = useState<string | null>(null);

  const petOptions = useMemo(
    () => pets.map((pet) => ({ label: pet.name, value: pet.id })),
    [pets],
  );
  const serviceOptions = useMemo(
    () => services.map((service) => ({ label: service.name, value: service.id })),
    [services],
  );
  const timeOptions = availableTimeSlots(form.values.date).map((time) => ({
    label: time,
    value: time,
  }));
  const selectedPet = petOptions.find((pet) => pet.value === form.values.petId);
  const selectedService = serviceOptions.find(
    (service) => service.value === form.values.serviceId,
  );

  const selectOption = (value: string) => {
    if (form.activePicker === "pet") form.updateValue("petId", value);
    if (form.activePicker === "service") form.updateValue("serviceId", value);
    if (form.activePicker === "time") form.updateValue("time", value);
  };

  const requestAppointment = async () => {
    if (submitting) return;
    const payload = form.submit();
    if (!payload) return;

    setFormError(null);
    try {
      await createAppointment(payload);
    } catch (error) {
      const { status } = parseApiError(error);
      if (status === 409) setFormError("Horario no disponible. Elige otra hora.");
      else if (status === 404) setFormError("No encontramos la mascota o el servicio seleccionado.");
      else if (status === 400) setFormError("La fecha o la hora no son válidas.");
      else setFormError(requestErrorMessage(status));
      return;
    }
    notify(
      "Cita solicitada",
      `Registramos la cita de ${selectedPet?.label ?? "tu mascota"} por ${
        selectedService?.label.toLowerCase() ?? "el servicio seleccionado"
      } el ${form.values.date} a las ${form.values.time}.`,
    );
    router.back();
  };

  const pickerOptions =
    form.activePicker === "pet"
      ? petOptions
      : form.activePicker === "service"
        ? serviceOptions
        : timeOptions;
  const pickerTitle =
    form.activePicker === "pet"
      ? "Elige una mascota"
      : form.activePicker === "service"
        ? "Elige un servicio"
        : "Elige una hora";
  const selectedPickerValue =
    form.activePicker === "pet"
      ? form.values.petId
      : form.activePicker === "service"
        ? form.values.serviceId
        : form.values.time;

  return (
    <FormScreen
      backLabel="Volver a citas"
      subtitle="Agenda una cita para una de tus mascotas."
      title="Nueva cita"
    >
        <View className="rounded-xl border border-border bg-secondary p-4">
          <Text className="font-sans-semibold text-secondary-foreground">Detalles de la cita</Text>
          <Text className="mt-1 text-sm leading-5 text-secondary-foreground">
            Selecciona la mascota, el servicio y el horario que prefieras.
          </Text>
        </View>

        <AppointmentSelectField
          disabled={pets.length === 0}
          error={form.errors.petId}
          label="Mascota *"
          onPress={() => form.setActivePicker("pet")}
          placeholder={
            petsLoading
              ? "Cargando mascotas..."
              : petsError
                ? "No pudimos cargar tus mascotas"
                : pets.length === 0
                  ? "Registra una mascota primero"
                  : "Selecciona una mascota"
          }
          value={selectedPet?.label ?? ""}
        />
        <AppointmentSelectField
          disabled={serviceOptions.length === 0}
          error={form.errors.serviceId}
          label="Servicio *"
          onPress={() => form.setActivePicker("service")}
          placeholder={
            servicesLoading
              ? "Cargando servicios..."
              : servicesError
                ? "No pudimos cargar los servicios"
                : serviceOptions.length === 0
                  ? "No hay servicios disponibles"
                  : "Selecciona un servicio"
          }
          value={selectedService?.label ?? ""}
        />
        <View className="mt-5">
          <Text className="mb-2 text-sm font-sans-semibold text-foreground">Fecha *</Text>
          <DateField
            accessibilityLabel="Fecha"
            invalid={!!form.errors.date}
            minimumDate={fromIsoDate(clinicNow().date)}
            onChange={(value) => form.updateValue("date", value)}
            placeholder="Selecciona la fecha"
            value={form.values.date}
          />
          {form.errors.date ? (
            <Text accessibilityRole="alert" className="mt-2 text-sm text-destructive">
              {form.errors.date}
            </Text>
          ) : null}
        </View>
        <AppointmentSelectField
          error={form.errors.time}
          label="Hora *"
          onPress={() => form.setActivePicker("time")}
          placeholder="Selecciona una hora"
          value={form.values.time}
        />

        {formError ? (
          <Text accessibilityRole="alert" className="mt-5 text-sm text-destructive">
            {formError}
          </Text>
        ) : null}
        <Button
          className="mt-8 min-h-12 rounded-lg"
          disabled={submitting}
          onPress={requestAppointment}
        >
          <ButtonText className="font-sans-semibold">
            {submitting ? "Enviando..." : "Solicitar cita"}
          </ButtonText>
        </Button>
      <OptionPicker
        onClose={() => form.setActivePicker(null)}
        onSelect={selectOption}
        options={pickerOptions}
        selectedValue={selectedPickerValue}
        title={pickerTitle}
        visible={form.activePicker !== null}
      />
    </FormScreen>
  );
}
