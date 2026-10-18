import { Eye, EyeOff } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { useAuthSession } from '@/features/auth/auth-session-context';
import { DecorativeIcon } from '@/features/shared/components/decorative-icon';
import { KeyboardScreen } from '@/features/shared/components/keyboard-screen';
import { AuthError } from '@/lib/auth-session';

import { requestErrorMessage } from '../validate';
import { AuthLink } from './auth-link';
import { LoginVisual } from './login-visual';

const loginSchema = z.object({
	email: z.string().email('Ingresa un correo válido'),
	password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginValues = z.infer<typeof loginSchema>;
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

function messageFor(error: unknown): string | null {
	switch (error instanceof AuthError ? error.code : 'unknown') {
		case 'validation':
			return null;
		case 'invalid-credentials':
			return 'Correo o contraseña incorrectos.';
		case 'rate-limited':
			return 'Demasiados intentos. Inténtalo de nuevo más tarde.';
		case 'not-customer':
			return 'Esta app es solo para clientes; usa la versión web.';
		case 'network':
		case 'verify-failed':
			return 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.';
		default:
			return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
	}
}

const emptyValues: LoginValues = { email: '', password: '' };

export function LoginScreen() {
	const { signIn, restoreFailed, retryRestore } = useAuthSession();
	const [values, setValues] = useState<LoginValues>(emptyValues);
	const [errors, setErrors] = useState<LoginErrors>({});
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isRetrying, setIsRetrying] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
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
				if (field === 'email' || field === 'password')
					nextErrors[field] = issue.message;
			}
			setErrors(nextErrors);
			return;
		}

		setFormError(null);
		setIsSubmitting(true);
		try {
			// On success the route guards move the user to the client area.
			await signIn(parsed.data.email, parsed.data.password);
		} catch (error) {
			const hasFieldErrors =
				error instanceof AuthError &&
				error.code === 'validation' &&
				Object.keys(error.fieldErrors).length > 0;
			if (hasFieldErrors) {
				setErrors({
					email: error.fieldErrors.email,
					password: error.fieldErrors.password,
				});
			}
			setFormError(
				hasFieldErrors ? null : (messageFor(error) ?? requestErrorMessage(400))
			);
			setIsSubmitting(false);
		}
	};

	const handleRetryRestore = async () => {
		setIsRetrying(true);
		await retryRestore();
		setIsRetrying(false);
	};

	return (
		<KeyboardScreen
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: 'center',
				paddingTop: insets.top + 32,
			}}
		>
			<View className="mx-auto w-full max-w-md">
				<LoginVisual />
				<View className="rounded-xl border border-border bg-card p-6 shadow-sm">
					<Text
						accessibilityRole="header"
						className="font-heading text-2xl text-foreground"
					>
						Bienvenida de vuelta
					</Text>
					<Text className="mt-2 text-base leading-6 text-muted-foreground">
						Ingresa para ver cómo están tus compañeros.
					</Text>

					{restoreFailed ? (
						<View className="mt-6 gap-3 rounded-lg border border-border bg-secondary p-4">
							<Text className="text-sm leading-5 text-secondary-foreground">
								No pudimos restaurar tu sesión por falta de conexión.
							</Text>
							<Button
								className="min-h-11 rounded-lg"
								disabled={isRetrying}
								onPress={handleRetryRestore}
								variant="outline"
							>
								{isRetrying ? <ButtonSpinner /> : null}
								<ButtonText className="font-sans-semibold">
									Reintentar
								</ButtonText>
							</Button>
						</View>
					) : null}

					<View className="mt-7 gap-5">
						<View className="gap-2">
							<Text className="text-sm font-sans-semibold text-foreground">
								Correo electrónico
							</Text>
							<Input
								className={`min-h-12 ${errors.email ? 'border-destructive' : ''}`}
							>
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
									onChangeText={(value) => updateValue('email', value)}
								/>
							</Input>
							{errors.email ? (
								<Text
									accessibilityRole="alert"
									className="text-sm text-destructive"
								>
									{errors.email}
								</Text>
							) : null}
						</View>

						<View className="gap-2">
							<Text className="text-sm font-sans-semibold text-foreground">
								Contraseña
							</Text>
							<Input
								className={`min-h-12 ${errors.password ? 'border-destructive' : ''}`}
							>
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
									onChangeText={(value) => updateValue('password', value)}
								/>
								<InputSlot>
									<Pressable
										accessibilityLabel={
											isPasswordVisible
												? 'Ocultar contraseña'
												: 'Mostrar contraseña'
										}
										accessibilityRole="button"
										className="-mr-3 h-11 w-11 items-center justify-center active:opacity-60"
										onPress={() => setIsPasswordVisible((visible) => !visible)}
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
								<Text
									accessibilityRole="alert"
									className="text-sm text-destructive"
								>
									{errors.password}
								</Text>
							) : null}
						</View>
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
						accessibilityLabel="Iniciar sesión"
						className="mt-7 min-h-12 rounded-lg"
						disabled={isSubmitting}
						onPress={handleSubmit}
					>
						{isSubmitting ? <ButtonSpinner /> : null}
						<ButtonText className="font-sans-semibold">
							{isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
						</ButtonText>
					</Button>

					<View className="mt-3 items-center">
						<AuthLink
							href="/(auth)/forgot-password"
							label="¿Olvidaste tu contraseña?"
						/>
						<AuthLink
							href="/(auth)/register"
							label="¿No tienes cuenta? Regístrate"
						/>
					</View>
				</View>
			</View>
		</KeyboardScreen>
	);
}
