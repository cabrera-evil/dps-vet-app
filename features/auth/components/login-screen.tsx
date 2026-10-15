import { z } from "zod";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { DecorativeIcon } from "@/features/shared/components/decorative-icon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { KeyboardScreen } from "@/features/shared/components/keyboard-screen";
import { useAuthSession } from "@/features/auth/auth-session-context";

import { LoginVisual } from "./login-visual";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const emptyValues: LoginValues = { email: "", password: "" };

export function LoginScreen() {
  const { signIn } = useAuthSession();
  const [values, setValues] = useState<LoginValues>(emptyValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);

  const updateValue = (field: keyof LoginValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: LoginErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password")
          nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(parsed.data);
      router.replace("/(client)/(tabs)");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardScreen
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: insets.top + 32,
      }}
    >
      <View className="mx-auto w-full max-w-md">
        <LoginVisual />
        <View className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Text accessibilityRole="header" className="font-heading text-2xl text-foreground">
            Bienvenida de vuelta
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted-foreground">
            Ingresa para ver cómo están tus compañeros.
          </Text>

          <View className="mt-7 gap-5">
            <View className="gap-2">
              <Text className="text-sm font-sans-semibold text-foreground">
                Correo electrónico
              </Text>
              <Input className={`min-h-12 ${errors.email ? "border-destructive" : ""}`}>
                <InputField
                  accessibilityLabel="Correo electrónico"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  returnKeyType="next"
                  placeholder="nombre@correo.com"
                  textContentType="emailAddress"
                  value={values.email}
                  onChangeText={(value) => updateValue("email", value)}
                />
              </Input>
              {errors.email ? (
                <Text accessibilityRole="alert" className="text-sm text-destructive">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-sans-semibold text-foreground">
                Contraseña
              </Text>
              <Input className={`min-h-12 ${errors.password ? "border-destructive" : ""}`}>
                <InputField
                  ref={passwordRef as never}
                  accessibilityLabel="Contraseña"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect={false}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="go"
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!isPasswordVisible}
                  textContentType="password"
                  value={values.password}
                  onChangeText={(value) => updateValue("password", value)}
                />
                <InputSlot>
                  <Pressable
                    accessibilityLabel={
                      isPasswordVisible
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    accessibilityRole="button"
                    className="-mr-3 h-11 w-11 items-center justify-center active:opacity-60"
                    onPress={() =>
                      setIsPasswordVisible((visible) => !visible)
                    }
                  >
                    <DecorativeIcon
                      as={isPasswordVisible ? EyeOff : Eye}
                      className="text-muted-foreground"
                      size="lg"
                    />
                  </Pressable>
                </InputSlot>
              </Input>
              {errors.password ? (
                <Text accessibilityRole="alert" className="text-sm text-destructive">
                  {errors.password}
                </Text>
              ) : null}
            </View>
          </View>

          <Button
            accessibilityLabel="Iniciar sesión en modo de vista previa"
            className="mt-7 min-h-12 rounded-lg"
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? <ButtonSpinner /> : null}
            <ButtonText className="font-sans-semibold">
              {isSubmitting ? "Preparando tu espacio…" : "Iniciar sesión"}
            </ButtonText>
          </Button>
          <Text className="mt-5 text-center text-sm leading-5 text-muted-foreground">
            Vista previa: cualquier correo válido y contraseña de 6 caracteres
            te llevan al panel simulado.
          </Text>
        </View>
      </View>
    </KeyboardScreen>
  );
}
