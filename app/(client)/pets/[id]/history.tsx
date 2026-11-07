import { useLocalSearchParams } from 'expo-router';

import { PetHistoryScreen } from '@/features/pets/components/pet-history-screen';

export default function PetHistoryRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <PetHistoryScreen id={id} />;
}
