import { router } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useAuthSession } from "@/features/auth/auth-session-context";

export function ProfileScreen() {
  const { session, signOut } = useAuthSession();

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "Salirás de esta vista previa.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-10 pt-7"
    >
      <Text className="font-heading text-3xl text-foreground">Tu perfil</Text>
      <Text className="mt-2 text-base text-muted-foreground">
        Una vista previa de tu espacio personal.
      </Text>

      <View className="mt-8 items-center rounded-3xl border border-border bg-card p-6">
        <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-secondary">
          <Text className="font-heading text-3xl text-secondary-foreground">
            {session?.client.firstName.slice(0, 1) ?? "C"}
          </Text>
        </View>
        <Text className="mt-4 font-heading text-2xl text-foreground">
          {session?.client.fullName}
        </Text>
        <Text className="mt-1 text-base text-muted-foreground">
          {session?.client.email}
        </Text>
      </View>

      <View className="mt-6 rounded-2xl bg-secondary/60 p-4">
        <Text className="font-semibold text-secondary-foreground">
          Modo de vista previa
        </Text>
        <Text className="mt-1 text-sm leading-5 text-secondary-foreground">
          Estos datos son simulados y se eliminarán al cerrar la aplicación.
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Cerrar sesión de la vista previa"
        className="mt-8 min-h-13 items-center justify-center rounded-2xl border border-destructive bg-card px-5"
        onPress={handleSignOut}
      >
        <Text className="font-semibold text-destructive">Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}
