import { router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
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

  const confirmCancel = (appointment: AppointmentView) =>
    Alert.alert(
      "Cancelar cita",
      `¿Quieres cancelar la cita de ${appointment.petName} (${appointment.serviceName})?`,
      [
        { text: "Conservar", style: "cancel" },
        {
          text: "Cancelar cita",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAppointment(appointment.id);
            } catch (error) {
              const { status } = parseApiError(error);
              Alert.alert(
                "No se pudo cancelar",
                status === 422
                  ? "La cita ya inició y no puede cancelarse."
                  : requestErrorMessage(status),
              );
            }
          },
        },
      ],
    );

  return (
    <ClientPlaceholderScreen
      actionLabel="Agendar una cita"
      description="Organiza las próximas visitas y recibe todos los detalles en un solo lugar."
      onAction={() => router.push("/(client)/appointments/new")}
      title="Mis citas"
    >
      {isPending ? <ActivityIndicator accessibilityLabel="Cargando citas" /> : null}
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
          className={`rounded-xl p-5 ${
            appointment.upcoming ? "bg-primary" : "border border-border bg-card"
          }`}
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
          {appointment.upcoming ? (
            <Pressable
              accessibilityLabel={`Cancelar cita de ${appointment.petName}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: cancelling }}
              className="mt-4 min-h-11 items-center justify-center rounded-lg bg-primary-foreground/15 active:opacity-70"
              disabled={cancelling}
              onPress={() => confirmCancel(appointment)}
            >
              <Text className="text-sm font-sans-semibold text-primary-foreground">
                Cancelar cita
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </ClientPlaceholderScreen>
  );
}
