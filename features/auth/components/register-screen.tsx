import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuthSession } from '@/features/auth/auth-session-context';
import { FormScreen } from '@/features/shared/components/form-screen';
import { usePost } from '@/hooks/use-rest';
import { parseApiError } from '@/lib/api-error';
import { registerSchema, type Register } from '@/schemas/register.schema';

import {
	requestErrorMessage,
	validateForm,
	type FieldErrors,
} from '../validate';
import { AuthField } from './auth-field';
import { AuthLink } from './auth-link';

const emptyValues: Register = {
	name: '',
	email: '',
	phone: '',
	password: '',
	confirmPassword: '',
};

export function RegisterScreen() {
	const { signIn } = useAuthSession();
	const { mutateAsync: register } = usePost();
	const [values, setValues] = useState<Register>(emptyValues);
	const [errors, setErrors] = useState<FieldErrors<Register>>({});
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const emailRef = useRef<TextInput>(null);
	const phoneRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);
	const confirmRef = useRef<TextInput>(null);

	const update = (field: keyof Register) => (value: string) => {
		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	};

	const handleSubmit = async () => {
		const result = validateForm(registerSchema, values);
		if (result.errors) {
			setErrors(result.errors);
			return;
		}

		const { name, email, phone, password } = result.data;
		setFormError(null);
		setIsSubmitting(true);
		try {
			// Only these four fields are sent; confirmPassword stays on the device.
			await register({
				url: '/users',
				payload: { name, email, phone, password },
			});
		} catch (error) {
			const { status, fieldErrors } = parseApiError(error);
			if (status === 409)
				setErrors({ email: 'Ya existe una cuenta con este correo.' });
			else if (status === 400 && Object.keys(fieldErrors).length)
				setErrors(fieldErrors);
			else setFormError(requestErrorMessage(status));
			setIsSubmitting(false);
			return;
		}

		try {
			await signIn(email, password); // route guards take over on success
		} catch {
			setFormError(
				'Tu cuenta fue creada, pero no pudimos iniciar sesión. Inténtalo desde la pantalla de acceso.'
			);
			setIsSubmitting(false);
		}
	};

	return (
		<FormScreen
			backLabel="Volver a iniciar sesión"
			subtitle="Crea tu cuenta para gestionar a tus mascotas."
			title="Crear cuenta"
		>
			<View className="gap-5">
				<AuthField
					autoComplete="name"
					autoCapitalize="words"
					error={errors.name}
					label="Nombre completo"
					onChangeText={update('name')}
					onSubmitEditing={() => emailRef.current?.focus()}
					returnKeyType="next"
					textContentType="name"
					value={values.name}
				/>
				<AuthField
					ref={emailRef}
					autoComplete="email"
					error={errors.email}
					keyboardType="email-address"
					label="Correo electrónico"
					onChangeText={update('email')}
					onSubmitEditing={() => phoneRef.current?.focus()}
					placeholder="nombre@correo.com"
					returnKeyType="next"
					textContentType="emailAddress"
					value={values.email}
				/>
				<AuthField
					ref={phoneRef}
					autoComplete="tel"
					error={errors.phone}
					keyboardType="phone-pad"
					label="Teléfono"
					onChangeText={update('phone')}
					onSubmitEditing={() => passwordRef.current?.focus()}
					returnKeyType="next"
					textContentType="telephoneNumber"
					value={values.phone}
				/>
				<AuthField
					ref={passwordRef}
					secure
					autoComplete="new-password"
					error={errors.password}
					label="Contraseña"
					onChangeText={update('password')}
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
					onChangeText={update('confirmPassword')}
					onSubmitEditing={handleSubmit}
					returnKeyType="go"
					textContentType="newPassword"
					value={values.confirmPassword}
				/>
			</View>

			{formError ? (
				<Text
					accessibilityRole="alert"
					className="mt-5 text-sm text-destructive"
				>
					{formError}
				</Text>
			) : null}

			<Button
				className="mt-7 min-h-12 rounded-lg"
				disabled={isSubmitting}
				onPress={handleSubmit}
			>
				{isSubmitting ? <ButtonSpinner /> : null}
				<ButtonText className="font-sans-semibold">
					{isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
				</ButtonText>
			</Button>
			<View className="mt-3 items-center">
				<AuthLink
					href="/(auth)/login"
					label="¿Ya tienes cuenta? Inicia sesión"
				/>
			</View>
		</FormScreen>
	);
}
