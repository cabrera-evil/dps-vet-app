import { Image } from 'expo-image';
import { Cat, Dog, PawPrint } from 'lucide-react-native';

import { DecorativeIcon } from '@/features/shared/components/decorative-icon';

const speciesIcon = (species: string) =>
	species === 'Gato' ? Cat : species === 'Perro' ? Dog : PawPrint;

// Decorative: the species is always shown as text next to the icon. With a `photoUrl` it fills
// its parent, which must clip (`overflow-hidden`) and set the size.
export function PetSpeciesIcon({
	species,
	photoUrl,
	className,
}: {
	species: string;
	photoUrl?: string;
	className?: string;
}) {
	if (photoUrl)
		return (
			<Image
				contentFit="cover"
				source={{ uri: photoUrl }}
				style={{ width: '100%', height: '100%' }}
			/>
		);
	return (
		<DecorativeIcon
			as={speciesIcon(species)}
			className={className ?? 'text-primary'}
			size="xl"
		/>
	);
}
