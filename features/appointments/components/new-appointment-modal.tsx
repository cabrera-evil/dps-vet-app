import { useMemo } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  appointmentServices,
  appointmentTimeSlots,
} from "@/features/appointments/appointment.mock";
import { useAppointmentForm } from "@/features/appointments/use-appointment-form";
import { usePetPreview } from "@/features/pets/pet-preview-context";

import { AppointmentOptionList } from "./appointment-option-list";
import { AppointmentSelectField } from "./appointment-select-field";

type NewAppointmentModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function NewAppointmentModal({
  visible,
  onClose,
}: NewAppointmentModalProps) {
  const { pets } = usePetPreview();
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

  const closeModal = () => {
    form.reset();
    onClose();
  };

  const selectOption = (value: string) => {
    if (form.activePicker === "pet") form.updateValue("petId", value);
    if (form.activePicker === "service") form.updateValue("serviceId", value);
    if (form.activePicker === "time") form.updateValue("time", value);
    form.setActivePicker(null);
  };

  const requestAppointment = () => {
    const appointment = form.submit();
    if (!appointment) return;

    const pet = petOptions.find((option) => option.value === appointment.petId);
    const service = serviceOptions.find(
      (option) => option.value === appointment.serviceId,
    );
    closeModal();
    Alert.alert(
      "Solicitud enviada",
      `Prepararemos una cita para ${pet?.label ?? "tu mascota"} por ${
        service?.label.toLowerCase() ?? "el servicio seleccionado"
      } el ${appointment.date} a las ${appointment.time}.`,
    );
  };

  const pickerContent =
    form.activePicker === "pet" ? {
      options: petOptions,
      selectedValue: form.values.petId,
      title: "Elige una mascota",
    } : form.activePicker === "service" ? {
      options: serviceOptions,
      selectedValue: form.values.serviceId,
      title: "Elige un servicio",
    } : form.activePicker === "time" ? {
      options: timeOptions,
      selectedValue: form.values.time,
      title: "Elige una hora",
    } : null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeModal}
      transparent
      visible={visible}
    >
      <View className="flex-1 bg-black/35">
        <Pressable
          accessibilityLabel="Cerrar nueva cita"
          className="absolute inset-0"
          onPress={closeModal}
        />
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", default: undefined })}
          className="flex-1 items-center justify-center px-5"
        >
          <View className="w-full max-w-md overflow-hidden rounded-3xl bg-card">
            {pickerContent ? (
              <AppointmentOptionList
                onBack={() => form.setActivePicker(null)}
                onSelect={selectOption}
                {...pickerContent}
              />
            ) : (
              <ScrollView
                contentContainerClassName="px-5 pb-5 pt-5"
                keyboardShouldPersistTaps="handled"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="font-heading text-xl text-foreground">Nueva cita</Text>
                    <Text className="mt-1 text-sm leading-5 text-muted-foreground">
                      Agenda una cita para una de tus mascotas.
                    </Text>
                  </View>
                  <Pressable accessibilityLabel="Cerrar nueva cita" hitSlop={12} onPress={closeModal}>
                    <Text className="text-xl text-muted-foreground">×</Text>
                  </Pressable>
                </View>

                <AppointmentSelectField
                  error={form.errors.petId}
                  label="Mascota"
                  onPress={() => form.setActivePicker("pet")}
                  placeholder="Selecciona una mascota"
                  value={selectedPet?.label ?? ""}
                />
                <AppointmentSelectField
                  error={form.errors.serviceId}
                  label="Servicio"
                  onPress={() => form.setActivePicker("service")}
                  placeholder="Selecciona un servicio"
                  value={selectedService?.label ?? ""}
                />
                <View className="mt-5">
                  <Text className="mb-2 text-sm font-semibold text-foreground">Fecha</Text>
                  <Input className={form.errors.date ? "border-destructive" : ""}>
                    <InputField
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                      placeholder="AAAA-MM-DD"
                      value={form.values.date}
                      onChangeText={form.updateDate}
                    />
                  </Input>
                  {form.errors.date ? <Text className="mt-2 text-sm text-destructive">{form.errors.date}</Text> : null}
                </View>
                <AppointmentSelectField
                  error={form.errors.time}
                  label="Hora"
                  onPress={() => form.setActivePicker("time")}
                  placeholder="Selecciona una hora"
                  value={form.values.time}
                />
                <Button className="mt-7 min-h-13 rounded-2xl" onPress={requestAppointment}>
                  <ButtonText className="font-semibold">Solicitar cita</ButtonText>
                </Button>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
