import { z } from "zod";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
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
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="min-h-full justify-center px-6 py-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-md">
          <LoginVisual />
          <View className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <Text className="font-heading text-2xl text-foreground">
              Bienvenida de vuelta
            </Text>
            <Text className="mt-2 text-base leading-6 text-muted-foreground">
              Ingresa para ver cómo están tus compañeros.
            </Text>

            <View className="mt-7 gap-5">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  Correo electrónico
                </Text>
                <Input className={errors.email ? "border-destructive" : ""}>
                  <InputField
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="nombre@correo.com"
                    textContentType="emailAddress"
                    value={values.email}
                    onChangeText={(value) => updateValue("email", value)}
                  />
                </Input>
                {errors.email ? (
                  <Text className="text-sm text-destructive">
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">
                  Contraseña
                </Text>
                <Input className={errors.password ? "border-destructive" : ""}>
                  <InputField
                    autoComplete="current-password"
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
                      hitSlop={10}
                      onPress={() =>
                        setIsPasswordVisible((visible) => !visible)
                      }
                    >
                      <Text className="text-sm font-semibold text-primary">
                        {isPasswordVisible ? "Ocultar" : "Mostrar"}
                      </Text>
                    </Pressable>
                  </InputSlot>
                </Input>
                {errors.password ? (
                  <Text className="text-sm text-destructive">
                    {errors.password}
                  </Text>
                ) : null}
              </View>
            </View>

            <Button
              accessibilityLabel="Iniciar sesión en modo de vista previa"
              className="mt-7 min-h-12 rounded-2xl"
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              {isSubmitting ? <ButtonSpinner /> : null}
              <ButtonText className="font-semibold">
                {isSubmitting ? "Preparando tu espacio…" : "Iniciar sesión"}
              </ButtonText>
            </Button>
            <Text className="mt-5 text-center text-sm leading-5 text-muted-foreground">
              Vista previa: cualquier correo válido y contraseña de 6 caracteres
              te llevan al panel simulado.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
