import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PetSpeciesIcon } from '@/features/pets/components/pet-species-icon';
import type { PetPhotoFile } from '@/types/pet.type';

const pickerOptions: ImagePicker.ImagePickerOptions = {
	mediaTypes: ['images'],
	allowsEditing: true,
	aspect: [1, 1],
	quality: 0.7,
};

/** Photo preview plus camera / gallery / remove actions; the upload itself happens on form save. */
export function PetPhotoField({
	species,
	uri,
	onPick,
	onRemove,
}: {
	species: string;
	/** Preview to show (picked file or stored photo); empty shows the species icon. */
	uri?: string;
	onPick: (photo: PetPhotoFile) => void;
	onRemove: () => void;
}) {
	const [message, setMessage] = useState<string | null>(null);

	const pick = async (source: 'camera' | 'library') => {
		setMessage(null);
		try {
			// The system gallery picker needs no permission; only the camera does.
			if (source === 'camera') {
				const permission = await ImagePicker.requestCameraPermissionsAsync();
				if (!permission.granted) {
					setMessage(
						'Necesitamos permiso para usar la cámara. Actívalo en los ajustes del dispositivo; puedes registrar a tu mascota sin foto.'
					);
					return;
				}
			}
			const result =
				source === 'camera'
					? await ImagePicker.launchCameraAsync(pickerOptions)
					: await ImagePicker.launchImageLibraryAsync(pickerOptions);
			const asset = result.canceled ? undefined : result.assets[0];
			if (!asset) return;
			const type = asset.mimeType ?? 'image/jpeg';
			onPick({
				uri: asset.uri,
				name: `pet-photo.${type.split('/')[1] ?? 'jpg'}`,
				type,
			});
		} catch {
			setMessage(
				source === 'camera'
					? 'No pudimos abrir la cámara.'
					: 'No pudimos abrir la galería.'
			);
		}
	};

	return (
		<View className="mt-6 items-center rounded-xl border border-border bg-card p-4">
			<View className="h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-secondary">
				<PetSpeciesIcon photoUrl={uri} species={species} />
			</View>
			<Text className="mt-3 text-sm text-muted-foreground">
				Foto (opcional)
			</Text>
			<View className="mt-3 w-full gap-2">
				<Button
					accessibilityLabel="Tomar foto"
					className="min-h-12 rounded-lg"
					onPress={() => pick('camera')}
					variant="outline"
				>
					<ButtonText>Tomar foto</ButtonText>
				</Button>
				<Button
					accessibilityLabel="Elegir de la galería"
					className="min-h-12 rounded-lg"
					onPress={() => pick('library')}
					variant="outline"
				>
					<ButtonText>Elegir de la galería</ButtonText>
				</Button>
				{uri ? (
					<Button
						accessibilityLabel="Quitar foto"
						className="min-h-12 rounded-lg"
						onPress={onRemove}
						variant="outline"
					>
						<ButtonText className="text-destructive">Quitar foto</ButtonText>
					</Button>
				) : null}
			</View>
			{message ? (
				<Text
					accessibilityRole="alert"
					className="mt-3 text-center text-sm text-destructive"
				>
					{message}
				</Text>
			) : null}
		</View>
	);
}
