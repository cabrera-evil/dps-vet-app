import { router } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useAuthSession } from "@/features/auth/auth-session-context";
import { dashboardMock } from "@/features/dashboard/dashboard.mock";
import { usePetPreview } from "@/features/pets/pet-preview-context";

import { DashboardSection } from "./dashboard-section";
import { PetSummaryCard } from "./pet-summary-card";

export function ClientDashboard() {
  const { session } = useAuthSession();
  const { pets } = usePetPreview();
  const appointment = dashboardMock.nextAppointment;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-10 pt-7"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-5">
          <Text className="text-sm font-semibold text-primary">SAN ROQUE</Text>
          <Text className="mt-2 font-heading text-3xl leading-9 text-foreground">
            Hola, {session?.client.firstName ?? "amiga"}
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted-foreground">
            Cuida a quienes hacen tus días mejores.
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
          <Text className="text-xl">☀️</Text>
        </View>
      </View>

      <DashboardSection title="Próxima cita">
        <View className="overflow-hidden rounded-3xl bg-primary p-5">
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-white/15 px-3 py-1">
              <Text className="text-xs font-semibold text-primary-foreground">
                CONFIRMADA
              </Text>
            </View>
            <Text className="text-xl">🐾</Text>
          </View>
          <Text className="mt-5 font-heading text-2xl text-primary-foreground">
            {appointment.petName}
          </Text>
          <Text className="mt-1 text-base text-primary-foreground/90">
            {appointment.service}
          </Text>
          <View className="mt-5 flex-row gap-2">
            <View className="rounded-xl bg-white/15 px-3 py-2">
              <Text className="text-sm font-medium text-primary-foreground">
                {appointment.dateLabel}
              </Text>
            </View>
            <View className="rounded-xl bg-white/15 px-3 py-2">
              <Text className="text-sm font-medium text-primary-foreground">
                {appointment.timeLabel}
              </Text>
            </View>
          </View>
        </View>
      </DashboardSection>

      <DashboardSection title="Tus compañeros" actionLabel="Ver todos">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="pr-6"
        >
          {pets.map((pet) => (
            <PetSummaryCard key={pet.id} pet={pet} />
          ))}
          <Pressable
            accessibilityLabel="Agregar mascota"
            className="w-32 items-center justify-center rounded-2xl border border-dashed border-primary bg-secondary/40 p-4"
            onPress={() => router.push("/(client)/pets/new")}
          >
            <Text className="text-2xl text-primary">+</Text>
            <Text className="mt-2 text-center text-sm font-semibold text-primary">
              Agregar
            </Text>
          </Pressable>
        </ScrollView>
      </DashboardSection>

      <DashboardSection title="Acciones rápidas">
        <View className="gap-3">
          {dashboardMock.quickActions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityLabel={action.label}
              className="flex-row items-center rounded-2xl border border-border bg-card p-4"
              onPress={() =>
                action.id === "book"
                  ? router.push("/(client)/appointments/new")
                  : Alert.alert("Próximamente", action.description)
              }
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Text className="text-lg">
                  {action.id === "book" ? "🗓️" : "📋"}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-foreground">
                  {action.label}
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </Text>
              </View>
              <Text className="text-lg text-primary">›</Text>
            </Pressable>
          ))}
        </View>
      </DashboardSection>
    </ScrollView>
  );
}
