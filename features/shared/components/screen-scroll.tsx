import { ScrollView } from '@/components/ui/scroll-view';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tab-screen scroller: clears the status bar / notch (tabs have no header).
export function ScreenScroll({ children }: { children: ReactNode }) {
	const insets = useSafeAreaInsets();

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{
				paddingTop: insets.top + 24,
				paddingBottom: 32,
			}}
		>
			{children}
		</ScrollView>
	);
}
