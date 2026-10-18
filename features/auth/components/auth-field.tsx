import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState, type ComponentProps } from 'react';
import { TextInput, View } from 'react-native';

import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { DecorativeIcon } from '@/features/shared/components/decorative-icon';

type AuthFieldProps = Omit<ComponentProps<typeof InputField>, 'className'> & {
	label: string;
	error?: string;
	/** Password field with a show/hide toggle. */
	secure?: boolean;
};

// Labelled text input with an inline error line (same look as the login form).
export const AuthField = forwardRef<TextInput, AuthFieldProps>(
	function AuthField({ label, error, secure, ...inputProps }, ref) {
		const [isVisible, setIsVisible] = useState(false);

		return (
			<View className="gap-2">
				<Text className="text-sm font-sans-semibold text-foreground">
					{label}
				</Text>
				<Input className={`min-h-12 ${error ? 'border-destructive' : ''}`}>
					<InputField
						ref={ref as never}
						accessibilityLabel={label}
						autoCapitalize="none"
						autoCorrect={false}
						secureTextEntry={secure && !isVisible}
						{...inputProps}
					/>
					{secure ? (
						<InputSlot>
							<Pressable
								accessibilityLabel={
									isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
								}
								accessibilityRole="button"
								className="-mr-3 h-11 w-11 items-center justify-center active:opacity-60"
								onPress={() => setIsVisible((visible) => !visible)}
							>
								<DecorativeIcon
									as={isVisible ? EyeOff : Eye}
									className="text-muted-foreground"
									size="lg"
								/>
							</Pressable>
						</InputSlot>
					) : null}
				</Input>
				{error ? (
					<Text accessibilityRole="alert" className="text-sm text-destructive">
						{error}
					</Text>
				) : null}
			</View>
		);
	}
);
