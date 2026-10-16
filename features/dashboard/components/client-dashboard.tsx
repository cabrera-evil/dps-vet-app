import { router } from "expo-router";
import { CalendarPlus, ChevronRight, ClipboardList, Moon, PawPrint, Plus, Sun } from "lucide-react-native";
import { View } from "react-native";

import { DecorativeIcon } from "@/features/shared/components/decorative-icon";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView } from "@/components/ui/scroll-view";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useNotice } from "@/hooks/use-notice";
import { useAuthSession } from "@/features/auth/auth-session-context";
import { dashboardMock } from "@/features/dashboard/dashboard.mock";
import { APPOINTMENT_STATUS_LABEL, useAppointmentViews } from "@/features/appointments/use-appointments";
import { formatClinicLongDate, formatClinicTime } from "@/utils/date";
import { useThemeMode } from "@/features/shared/theme-mode";
import { petAccent, usePets } from "@/features/pets/use-pets";
import { SCREEN_GUTTER } from "@/features/shared/layout";
import { ScreenScroll } from "@/features/shared/components/screen-scroll";

import { DashboardSection } from "./dashboard-section";
import { PetSummaryCard } from "./pet-summary-card";

export function ClientDashboard() {
  const notify = useNotice();
  const { user } = useAuthSession();
  const { pets, isPending, isError, refetch } = usePets();
  const {
    nextAppointment: appointment,
    isPending: appointmentLoading,
    isError: appointmentError,
    refetch: refetchAppointments,
  } = useAppointmentViews();
  const { scheme, setMode } = useThemeMode();
  const isDark = scheme === "dark";

  return (
    <ScreenScroll>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-5">
          <Text className="text-sm font-sans-semibold text-primary">SAN ROQUE</Text>
          <Text accessibilityRole="header" className="mt-2 font-heading text-3xl leading-9 text-foreground">
            Hola, {user?.name?.split(" ")[0] ?? "amiga"}
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted-foreground">
            Cuida a quienes hacen tus días mejores.
          </Text>
        </View>
        <Pressable
          accessibilityLabel={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-lg bg-secondary active:opacity-70"
          onPress={() => setMode(isDark ? "light" : "dark")}
        >
          <DecorativeIcon
            as={isDark ? Moon : Sun}
            className="text-primary"
            size="xl"
          />
        </Pressable>
      </View>

      <DashboardSection title="Próxima cita">
        {appointmentLoading ? (
          <Spinner accessibilityLabel="Cargando próxima cita" />
        ) : appointmentError ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-11 justify-center rounded-xl border border-border bg-card p-4 active:opacity-70"
            onPress={() => refetchAppointments()}
          >
            <Text className="text-center text-muted-foreground">
              No pudimos cargar tu próxima cita. Toca para reintentar.
            </Text>
          </Pressable>
        ) : !appointment ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-11 items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 active:opacity-70"
            onPress={() => router.push("/(client)/appointments/new")}
          >
            <Text className="text-center text-muted-foreground">
              No tienes citas próximas. Toca para agendar una.
            </Text>
          </Pressable>
        ) : (
        <Pressable
          accessibilityLabel={`Ver cita de ${appointment.petName}`}
          accessibilityRole="button"
          className="overflow-hidden rounded-xl bg-primary p-5 active:opacity-70"
          onPress={() =>
            router.push({ pathname: "/(client)/appointments/[id]", params: { id: appointment.id } })
          }
        >
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-primary-foreground/15 px-3 py-1">
              <Text className="text-xs font-sans-semibold text-primary-foreground">
                {APPOINTMENT_STATUS_LABEL[appointment.status]}
              </Text>
            </View>
            <DecorativeIcon
              as={PawPrint}
              className="text-primary-foreground"
              size="xl"
            />
          </View>
          <Text className="mt-5 font-heading text-2xl text-primary-foreground">
            {appointment.petName}
          </Text>
          <Text className="mt-1 text-base text-primary-foreground/90">
            {appointment.serviceName}
          </Text>
          <View className="mt-5 flex-row gap-2">
            <View className="rounded-lg bg-primary-foreground/15 px-3 py-2">
              <Text className="text-sm font-sans-medium text-primary-foreground">
                {formatClinicLongDate(appointment.start)}
              </Text>
            </View>
            <View className="rounded-lg bg-primary-foreground/15 px-3 py-2">
              <Text className="text-sm font-sans-medium text-primary-foreground">
                {formatClinicTime(appointment.start)}
              </Text>
            </View>
          </View>
        </Pressable>
        )}
      </DashboardSection>

      <DashboardSection
        actionLabel="Ver todos"
        onActionPress={() => router.push("/(client)/(tabs)/pets")}
        title="Tus compañeros"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: SCREEN_GUTTER }}
          horizontal
          style={{ marginHorizontal: -SCREEN_GUTTER }}
          showsHorizontalScrollIndicator={false}
        >
          {isPending ? (
            <View className="mr-3 min-h-11 w-40 items-center justify-center">
              <Spinner accessibilityLabel="Cargando mascotas" />
            </View>
          ) : null}
          {isError ? (
            <Pressable
              accessibilityRole="button"
              className="mr-3 min-h-11 w-40 justify-center rounded-xl border border-border bg-card p-4 active:opacity-70"
              onPress={() => refetch()}
            >
              <Text className="text-sm text-muted-foreground">
                No pudimos cargar tus mascotas. Toca para reintentar.
              </Text>
            </Pressable>
          ) : null}
          {pets.map((pet, index) => (
            <PetSummaryCard key={pet.id} accent={petAccent(index)} pet={pet} />
          ))}
          <Pressable
            accessibilityLabel="Agregar mascota"
            accessibilityRole="button"
            className="min-h-11 w-32 items-center justify-center rounded-xl border border-dashed border-primary bg-secondary p-4 active:opacity-70"
            onPress={() => router.push("/(client)/pets/new")}
          >
            <DecorativeIcon
              as={Plus}
              className="text-primary"
              size="xl"
            />
            <Text className="mt-2 text-center text-sm font-sans-semibold text-primary">
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
              accessibilityRole="button"
              className="min-h-11 flex-row items-center rounded-xl border border-border bg-card p-4 active:bg-muted"
              onPress={() => {
                if (action.id === "book") router.push("/(client)/appointments/new");
                else if (pets.length === 1)
                  router.push({ pathname: "/(client)/pets/[id]", params: { id: pets[0].id } });
                else if (pets.length > 1) router.push("/(client)/(tabs)/pets");
                else notify("Sin mascotas", "Registra una mascota para ver su historial.");
              }}
            >
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <DecorativeIcon
                  as={action.id === "book" ? CalendarPlus : ClipboardList}
                  className="text-primary"
                  size="xl"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-sans-semibold text-foreground">
                  {action.label}
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </Text>
              </View>
              <DecorativeIcon
                as={ChevronRight}
                className="text-muted-foreground"
                size="lg"
              />
            </Pressable>
          ))}
        </View>
      </DashboardSection>
    </ScreenScroll>
  );
}
