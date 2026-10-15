import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { TextInput, View } from "react-native";

import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useNotice } from "@/hooks/use-notice";
import { FormScreen } from "@/features/shared/components/form-screen";
import { usePost } from "@/hooks/use-rest";
import { parseApiError } from "@/lib/api-error";
import { resetPasswordSchema, type ResetPassword } from "@/schemas/reset-password.schema";

import { AuthField } from "./auth-field";
import { AuthLink } from "./auth-link";
import { requestErrorMessage, validateForm, type FieldErrors } from "../validate";

const emptyValues: ResetPassword = { password: "", confirmPassword: "" };

export function ResetPasswordScreen() {
  // E4: the code normally arrives as a route param; a manual field covers the case it does not.
  const { oobCode: paramCode } = useLocalSearchParams<{ oobCode?: string }>();
  const { mutateAsync: resetPassword, isPending } = usePost();
  const [manualCode, setManualCode] = useState("");
  const [values, setValues] = useState<ResetPassword>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<ResetPassword & { oobCode: string }>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const confirmRef = useRef<TextInput>(null);
  const notify = useNotice();
  const rawCode = Array.isArray(paramCode) ? paramCode[0] : paramCode;
  const oobCode = (rawCode || manualCode).trim();

  const update = (field: keyof ResetPassword) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const result = validateForm(resetPasswordSchema, values);
    const nextErrors: typeof errors = result.errors ?? {};
    if (!oobCode) nextErrors.oobCode = "Ingresa el código de tu correo";
    if (result.errors || nextErrors.oobCode) {
      setErrors(nextErrors);
      return;
    }

    setFormError(null);
    try {
      await resetPassword({
        url: "/auth/reset-password",
        payload: { oobCode, password: result.data.password },
      });
    } catch (e) {
      const { status, fieldErrors } = parseApiError(e);
      if (status === 400) {
        setErrors({ password: fieldErrors.password, oobCode: fieldErrors.oobCode });
        setFormError(
          fieldErrors.password
            ? null
            : "El enlace no es válido o ya venció. Solicita uno nuevo.",
        );
      } else setFormError(requestErrorMessage(status));
      return;
    }

    notify("Contraseña actualizada", "Ya puedes iniciar sesión con tu nueva contraseña.");
    router.replace("/(auth)/login");
  };

  return (
    <FormScreen
      backLabel="Volver a iniciar sesión"
      subtitle="Elige una contraseña nueva."
      title="Nueva contraseña"
    >
      <View className="gap-5">
        {rawCode ? null : (
          <AuthField
            error={errors.oobCode}
            label="Código del correo"
            onChangeText={(value) => {
              setManualCode(value);
              setErrors((current) => ({ ...current, oobCode: undefined }));
            }}
            returnKeyType="next"
            value={manualCode}
          />
        )}
        <AuthField
          secure
          autoComplete="new-password"
          error={errors.password}
          label="Contraseña nueva"
          onChangeText={update("password")}
          onSubmitEditing={() => confirmRef.current?.focus()}
          placeholder="Mínimo 8 caracteres"
          returnKeyType="next"
          textContentType="newPassword"
          value={values.password}
        />
        <AuthField
          ref={confirmRef}
          secure
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Confirmar contraseña"
          onChangeText={update("confirmPassword")}
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
          textContentType="newPassword"
          value={values.confirmPassword}
        />
      </View>

      {formError ? (
        <Text accessibilityRole="alert" className="mt-5 text-sm text-destructive">
          {formError}
        </Text>
      ) : null}

      <Button className="mt-7 min-h-12 rounded-lg" disabled={isPending} onPress={handleSubmit}>
        {isPending ? <ButtonSpinner /> : null}
        <ButtonText className="font-sans-semibold">
          {isPending ? "Guardando…" : "Cambiar contraseña"}
        </ButtonText>
      </Button>
      <View className="mt-3 items-center">
        <AuthLink href="/(auth)/login" label="Volver a iniciar sesión" />
      </View>
    </FormScreen>
  );
}
