import { useState } from "react";
import { View } from "react-native";

import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { FormScreen } from "@/features/shared/components/form-screen";
import { usePost } from "@/hooks/use-rest";
import { parseApiError } from "@/lib/api-error";
import { forgotPasswordSchema } from "@/schemas/forgot-password.schema";

import { AuthField } from "./auth-field";
import { AuthLink } from "./auth-link";
import { requestErrorMessage, validateForm } from "../validate";

export function ForgotPasswordScreen() {
  const { mutateAsync: requestReset, isPending } = usePost();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const result = validateForm(forgotPasswordSchema, { email });
    if (result.errors) {
      setError(result.errors.email);
      return;
    }

    setFormError(null);
    try {
      await requestReset({ url: "/auth/forgot-password", payload: result.data });
      setSent(true); // same confirmation for every 200, whether or not the account exists
    } catch (e) {
      const { status, fieldErrors } = parseApiError(e);
      if (status === 400 && fieldErrors.email) setError(fieldErrors.email);
      else setFormError(requestErrorMessage(status));
    }
  };

  return (
    <FormScreen
      backLabel="Volver a iniciar sesión"
      subtitle="Te enviaremos un enlace para restablecerla."
      title="Recuperar contraseña"
    >
      {sent ? (
        <View className="rounded-xl border border-border bg-secondary p-4">
          <Text accessibilityRole="alert" className="text-sm leading-5 text-secondary-foreground">
            Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
          </Text>
        </View>
      ) : (
        <>
          <AuthField
            autoComplete="email"
            error={error}
            keyboardType="email-address"
            label="Correo electrónico"
            onChangeText={(value) => {
              setEmail(value);
              setError(undefined);
            }}
            onSubmitEditing={handleSubmit}
            placeholder="nombre@correo.com"
            returnKeyType="go"
            textContentType="emailAddress"
            value={email}
          />
          {formError ? (
            <Text accessibilityRole="alert" className="mt-5 text-sm text-destructive">
              {formError}
            </Text>
          ) : null}
          <Button className="mt-7 min-h-12 rounded-lg" disabled={isPending} onPress={handleSubmit}>
            {isPending ? <ButtonSpinner /> : null}
            <ButtonText className="font-sans-semibold">
              {isPending ? "Enviando…" : "Enviar enlace"}
            </ButtonText>
          </Button>
        </>
      )}
      <View className="mt-3 items-center">
        <AuthLink href="/(auth)/login" label="Volver a iniciar sesión" />
      </View>
    </FormScreen>
  );
}
