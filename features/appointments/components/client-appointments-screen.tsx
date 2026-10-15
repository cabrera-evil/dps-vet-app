import { router } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { ClientPlaceholderScreen } from "@/features/dashboard/components/client-placeholder-screen";
import { dashboardMock } from "@/features/dashboard/dashboard.mock";

export function ClientAppointmentsScreen() {
  const appointment = dashboardMock.nextAppointment;

  return (
    <ClientPlaceholderScreen
      actionLabel="Agendar una cita"
      description="Organiza las próximas visitas y recibe todos los detalles en un solo lugar."
      onAction={() => router.push("/(client)/appointments/new")}
      title="Mis citas"
    >
      <View className="rounded-xl bg-primary p-5">
        <Text className="text-sm font-sans-semibold text-primary-foreground">
          PRÓXIMA VISITA
        </Text>
        <Text className="mt-4 font-heading text-2xl text-primary-foreground">
          {appointment.petName}
        </Text>
        <Text className="mt-1 text-base text-primary-foreground/90">
          {appointment.service}
        </Text>
        <View className="mt-5 rounded-lg bg-primary-foreground/15 p-3">
          <Text className="text-sm font-sans-medium text-primary-foreground">
            {appointment.dateLabel} · {appointment.timeLabel}
          </Text>
        </View>
      </View>
    </ClientPlaceholderScreen>
  );
}
