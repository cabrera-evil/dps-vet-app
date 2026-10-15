import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { DecorativeIcon } from "@/features/shared/components/decorative-icon";
import { Text } from "@/components/ui/text";
import { useAuthSession } from "@/features/auth/auth-session-context";
import { ScreenScroll } from "@/features/shared/components/screen-scroll";

export function ProfileScreen() {
  const { user, signOut } = useAuthSession();

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <ScreenScroll>
      <Text accessibilityRole="header" className="font-heading text-3xl text-foreground">Tu perfil</Text>
      <Text className="mt-2 text-base text-muted-foreground">
        Tu espacio personal.
      </Text>

      <View className="mt-8 items-center rounded-xl border border-border bg-card p-6">
        <View className="h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
          <Text className="font-heading text-3xl text-secondary-foreground">
            {user?.name?.slice(0, 1).toUpperCase() ?? "C"}
          </Text>
        </View>
        <Text className="mt-4 font-heading text-2xl text-foreground">
          {user?.name}
        </Text>
        <Text className="mt-1 text-base text-muted-foreground">
          {user?.email}
        </Text>
      </View>

      <Button
        accessibilityLabel="Cerrar sesión"
        className="mt-8 min-h-12 rounded-lg border-destructive"
        onPress={() => setConfirmOpen(true)}
        variant="outline"
      >
        <DecorativeIcon
          as={LogOut}
          className="text-destructive"
          size="lg"
        />
        <ButtonText className="font-sans-semibold text-destructive">Cerrar sesión</ButtonText>
      </Button>
      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Cerrar sesión"
        destructive
        isOpen={confirmOpen}
        message="¿Seguro que quieres salir?"
        onClose={() => setConfirmOpen(false)}
        // The route guards send the user to login once the session ends.
        onConfirm={() => void signOut()}
        title="Cerrar sesión"
      />
    </ScreenScroll>
  );
}
