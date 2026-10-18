import { Stack } from 'expo-router';

import { SCENE_GUTTER_STYLE } from '@/features/shared/layout';

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{ headerShown: false, contentStyle: SCENE_GUTTER_STYLE }}
		/>
	);
}
