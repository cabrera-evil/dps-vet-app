import { View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { requestErrorMessage } from '@/features/auth/validate';
import { FormScreen } from '@/features/shared/components/form-screen';
import { parseApiError } from '@/lib/api-error';

type PetLoadStatusProps = {
	title: string;
	error: unknown;
	onRetry: () => void;
};

/** Loading / not-found / error body shared by the pet detail and edit screens. */
export function PetLoadStatus({ title, error, onRetry }: PetLoadStatusProps) {
	const { status } = parseApiError(error);
	const notFound = status === 404;

	return (
		<FormScreen backLabel="Volver" subtitle="Mascota" title={title}>
			<View className="rounded-xl border border-dashed border-border bg-card p-6">
				<Text className="text-center text-muted-foreground">
					{notFound
						? 'No encontramos esta mascota. Puede que ya no exista.'
						: requestErrorMessage(status)}
				</Text>
				{notFound ? null : (
					<Button
						className="mt-4 min-h-12 rounded-lg"
						onPress={onRetry}
						variant="outline"
					>
						<ButtonText>Reintentar</ButtonText>
					</Button>
				)}
			</View>
		</FormScreen>
	);
}

export function PetLoading({ title }: { title: string }) {
	return (
		<FormScreen backLabel="Volver" subtitle="Mascota" title={title}>
			<Spinner accessibilityLabel="Cargando mascota" />
		</FormScreen>
	);
}
