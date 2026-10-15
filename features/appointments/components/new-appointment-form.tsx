import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, View } from "react-native";

import { OptionPicker } from "@/components/option-picker";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  appointmentServices,
  appointmentTimeSlots,
} from "@/features/appointments/appointment.mock";
import { useAppointmentForm } from "@/features/appointments/use-appointment-form";
import { usePets } from "@/features/pets/use-pets";
import { FormScreen } from "@/features/shared/components/form-screen";

import { AppointmentSelectField } from "./appointment-select-field";

export function NewAppointmentForm() {
  const { pets, isPending: petsLoading, isError: petsError } = usePets();
  const form = useAppointmentForm();

  const petOptions = useMemo(
    () => pets.map((pet) => ({ label: pet.name, value: pet.id })),
    [pets],
  );
  const serviceOptions = appointmentServices.map((service) => ({
    label: service.label,
    value: service.id,
  }));
  const timeOptions = appointmentTimeSlots.map((time) => ({
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

  const requestAppointment = () => {
    const appointment = form.submit();
    if (!appointment) return;

    const pet = petOptions.find((option) => option.value === appointment.petId);
    const service = serviceOptions.find(
      (option) => option.value === appointment.serviceId,
    );
    Alert.alert(
      "Solicitud enviada",
      `Prepararemos una cita para ${pet?.label ?? "tu mascota"} por ${
        service?.label.toLowerCase() ?? "el servicio seleccionado"
      } el ${appointment.date} a las ${appointment.time}.`,
      [{ text: "Ver mis citas", onPress: () => router.back() }],
    );
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
          error={form.errors.serviceId}
          label="Servicio *"
          onPress={() => form.setActivePicker("service")}
          placeholder="Selecciona un servicio"
          value={selectedService?.label ?? ""}
        />
        <View className="mt-5">
          <Text className="mb-2 text-sm font-sans-semibold text-foreground">Fecha *</Text>
          <Input className={`min-h-12 ${form.errors.date ? "border-destructive" : ""}`}>
            <InputField
              accessibilityLabel="Fecha"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              placeholder="AAAA-MM-DD"
              value={form.values.date}
              onChangeText={form.updateDate}
            />
          </Input>
          <Text className="mt-2 text-sm text-muted-foreground">Ejemplo: 2026-10-20</Text>
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

        <Button className="mt-8 min-h-12 rounded-lg" onPress={requestAppointment}>
          <ButtonText className="font-sans-semibold">Solicitar cita</ButtonText>
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
