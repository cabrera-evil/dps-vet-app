import { ChevronDown } from 'lucide-react-native';
import { View } from 'react-native';

import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { DecorativeIcon } from '@/features/shared/components/decorative-icon';

type AppointmentSelectFieldProps = {
	label: string;
	placeholder: string;
	value: string;
	error?: string;
	disabled?: boolean;
	onPress: () => void;
};

// Labelled picker trigger shared by the appointment and pet forms.
export function AppointmentSelectField({
	label,
	placeholder,
	value,
	error,
	disabled,
	onPress,
}: AppointmentSelectFieldProps) {
	return (
		<View className="mt-5">
			<Text className="mb-2 text-sm font-sans-semibold text-foreground">
				{label}
			</Text>
			<Pressable
				accessibilityHint="Abre una lista de opciones"
				accessibilityLabel={`${label}: ${value || placeholder}`}
				accessibilityRole="button"
				accessibilityState={{ disabled: !!disabled }}
				className={`min-h-12 flex-row items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 active:bg-muted ${
					error ? 'border-destructive' : 'border-input'
				} ${disabled ? 'opacity-50' : ''}`}
				disabled={disabled}
				onPress={onPress}
			>
				<Text
					className={`flex-1 ${value ? 'text-foreground' : 'text-muted-foreground'}`}
				>
					{value || placeholder}
				</Text>
				<DecorativeIcon
					as={ChevronDown}
					className="text-muted-foreground"
					size="lg"
				/>
			</Pressable>
			{error ? (
				<Text
					accessibilityRole="alert"
					className="mt-2 text-sm text-destructive"
				>
					{error}
				</Text>
			) : null}
		</View>
	);
}
