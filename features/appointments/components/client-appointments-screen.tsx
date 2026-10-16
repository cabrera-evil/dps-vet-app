import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useNotice } from "@/hooks/use-notice";
import {
  APPOINTMENT_STATUS_LABEL,
  type AppointmentView,
  useAppointmentViews,
  useCancelAppointment,
} from "@/features/appointments/use-appointments";
import { requestErrorMessage } from "@/features/auth/validate";
import { ClientPlaceholderScreen } from "@/features/dashboard/components/client-placeholder-screen";
import { parseApiError } from "@/lib/api-error";
import { formatClinicLongDate, formatClinicTime } from "@/utils/date";

export function ClientAppointmentsScreen() {
  const { views, isPending, isError, refetch } = useAppointmentViews();
  const { cancelAppointment, isPending: cancelling } = useCancelAppointment();

  const notify = useNotice();
  const [toCancel, setToCancel] = useState<AppointmentView | null>(null);

  const cancel = async (appointment: AppointmentView) => {
    try {
      await cancelAppointment(appointment.id);
    } catch (error) {
      const { status } = parseApiError(error);
      notify(
        "No se pudo cancelar",
        status === 422
          ? "La cita ya inició y no puede cancelarse."
          : requestErrorMessage(status),
      );
    }
  };

  return (
    <ClientPlaceholderScreen
      actionLabel="Agendar una cita"
      description="Organiza las próximas visitas y recibe todos los detalles en un solo lugar."
      onAction={() => router.push("/(client)/appointments/new")}
      title="Mis citas"
    >
      {isPending ? <Spinner accessibilityLabel="Cargando citas" /> : null}
      {isError ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-11 items-center justify-center rounded-xl border border-border bg-card p-4 active:opacity-70"
          onPress={() => refetch()}
        >
          <Text className="text-center text-muted-foreground">
            No pudimos cargar tus citas. Toca para reintentar.
          </Text>
        </Pressable>
      ) : null}
      {!isPending && !isError && views.length === 0 ? (
        <View className="items-center rounded-xl border border-dashed border-border bg-card p-6">
          <Text className="text-center text-muted-foreground">
            Aún no tienes citas agendadas.
          </Text>
        </View>
      ) : null}
      {views.map((appointment) => (
        <View
          key={appointment.id}
          className={`rounded-xl ${
            appointment.upcoming ? "bg-primary" : "border border-border bg-card"
          }`}
        >
          <Pressable
            accessibilityLabel={`Ver cita de ${appointment.petName}`}
            accessibilityRole="button"
            className="p-5 active:opacity-70"
            onPress={() =>
              router.push({ pathname: "/(client)/appointments/[id]", params: { id: appointment.id } })
            }
          >
          <Text
            className={`text-xs font-sans-semibold ${
              appointment.upcoming ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {APPOINTMENT_STATUS_LABEL[appointment.status]}
          </Text>
          <Text
            className={`mt-3 font-heading text-2xl ${
              appointment.upcoming ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            {appointment.petName}
          </Text>
          <Text
            className={`mt-1 text-base ${
              appointment.upcoming ? "text-primary-foreground/90" : "text-muted-foreground"
            }`}
          >
            {appointment.serviceName}
          </Text>
          <Text
            className={`mt-3 text-sm font-sans-medium ${
              appointment.upcoming ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            {formatClinicLongDate(appointment.start)} · {formatClinicTime(appointment.start)}
          </Text>
          </Pressable>
          {appointment.upcoming ? (
            <Pressable
              accessibilityLabel={`Cancelar cita de ${appointment.petName}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: cancelling }}
              className="mx-5 mb-5 min-h-11 items-center justify-center rounded-lg bg-primary-foreground/15 active:opacity-70"
              disabled={cancelling}
              onPress={() => setToCancel(appointment)}
            >
              <Text className="text-sm font-sans-semibold text-primary-foreground">
                Cancelar cita
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      <ConfirmDialog
        cancelLabel="Conservar"
        confirmLabel="Cancelar cita"
        destructive
        isOpen={toCancel !== null}
        message={`¿Quieres cancelar la cita de ${toCancel?.petName} (${toCancel?.serviceName})?`}
        onClose={() => setToCancel(null)}
        onConfirm={() => toCancel && void cancel(toCancel)}
        title="Cancelar cita"
      />
    </ClientPlaceholderScreen>
  );
}
