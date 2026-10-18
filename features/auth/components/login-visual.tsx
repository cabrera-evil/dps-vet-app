import { PawPrint } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { DecorativeIcon } from '@/features/shared/components/decorative-icon';

export function LoginVisual() {
	return (
		<View className="items-center py-6">
			<View className="h-24 w-24 items-center justify-center rounded-full bg-secondary">
				<DecorativeIcon as={PawPrint} className="h-12 w-12 text-primary" />
			</View>
			<Text
				accessibilityRole="header"
				className="mt-4 font-heading text-2xl text-foreground"
			>
				San Roque
			</Text>
			<Text className="mt-1 text-sm text-muted-foreground">
				Tu veterinaria de confianza
			</Text>
		</View>
	);
}
