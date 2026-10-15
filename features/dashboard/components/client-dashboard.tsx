import { router } from "expo-router";
import { CalendarPlus, ChevronRight, ClipboardList, Moon, PawPrint, Plus, Sun } from "lucide-react-native";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";

import { DecorativeIcon } from "@/features/shared/components/decorative-icon";
import { Text } from "@/components/ui/text";
import { useAuthSession } from "@/features/auth/auth-session-context";
import { dashboardMock } from "@/features/dashboard/dashboard.mock";
import { useThemeMode } from "@/features/shared/theme-mode";
import { petAccent, usePets } from "@/features/pets/use-pets";
import { SCREEN_GUTTER } from "@/features/shared/layout";
import { ScreenScroll } from "@/features/shared/components/screen-scroll";

import { DashboardSection } from "./dashboard-section";
import { PetSummaryCard } from "./pet-summary-card";

export function ClientDashboard() {
  const { user } = useAuthSession();
  const { pets, isPending, isError, refetch } = usePets();
  const appointment = dashboardMock.nextAppointment;
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
        <View className="overflow-hidden rounded-xl bg-primary p-5">
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-primary-foreground/15 px-3 py-1">
              <Text className="text-xs font-sans-semibold text-primary-foreground">
                CONFIRMADA
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
            {appointment.service}
          </Text>
          <View className="mt-5 flex-row gap-2">
            <View className="rounded-lg bg-primary-foreground/15 px-3 py-2">
              <Text className="text-sm font-sans-medium text-primary-foreground">
                {appointment.dateLabel}
              </Text>
            </View>
            <View className="rounded-lg bg-primary-foreground/15 px-3 py-2">
              <Text className="text-sm font-sans-medium text-primary-foreground">
                {appointment.timeLabel}
              </Text>
            </View>
          </View>
        </View>
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
              <ActivityIndicator accessibilityLabel="Cargando mascotas" />
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
              onPress={() =>
                action.id === "book"
                  ? router.push("/(client)/appointments/new")
                  : Alert.alert("Próximamente", action.description)
              }
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
