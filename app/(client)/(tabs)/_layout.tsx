import { Tabs } from 'expo-router';
import { CalendarDays, House, PawPrint, User } from 'lucide-react-native';

import { SCENE_GUTTER_STYLE } from '@/features/shared/layout';
import { navigationTokens } from '@/features/shared/navigation-theme';
import { useThemeScheme } from '@/features/shared/use-theme-scheme';

export default function ClientTabsLayout() {
	const colors = navigationTokens[useThemeScheme()];

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				sceneStyle: SCENE_GUTTER_STYLE,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.mutedForeground,
				tabBarLabelStyle: { fontFamily: 'Geist_600SemiBold', fontSize: 12 },
				tabBarStyle: {
					backgroundColor: colors.card,
					borderTopColor: colors.border,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Inicio',
					tabBarIcon: ({ color }) => <House color={color} size={24} />,
				}}
			/>
			<Tabs.Screen
				name="pets"
				options={{
					title: 'Mascotas',
					tabBarIcon: ({ color }) => <PawPrint color={color} size={24} />,
				}}
			/>
			<Tabs.Screen
				name="appointments"
				options={{
					title: 'Citas',
					tabBarIcon: ({ color }) => <CalendarDays color={color} size={24} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Perfil',
					tabBarIcon: ({ color }) => <User color={color} size={24} />,
				}}
			/>
		</Tabs>
	);
}
