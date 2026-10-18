import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useState,
	type ReactNode,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { colorScheme as cssColorScheme } from 'react-native-css';

export type ThemeMode = 'light' | 'dark' | 'system';
type ThemeScheme = 'light' | 'dark';

const STORAGE_KEY = 'theme-mode';

type ThemeModeValue = {
	mode: ThemeMode;
	scheme: ThemeScheme;
	setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeValue | null>(null);

// expo-secure-store is a native module: a dev build made before it was added lacks it and
// importing it throws at load. Resolve it lazily so the theme still works (unsaved) there.
type Storage = {
	get: () => Promise<string | null>;
	set: (value: string) => Promise<void>;
};
const storage: Storage = (() => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const SecureStore =
			require('expo-secure-store') as typeof import('expo-secure-store');
		return {
			get: () => SecureStore.getItemAsync(STORAGE_KEY),
			set: (value) => SecureStore.setItemAsync(STORAGE_KEY, value),
		};
	} catch {
		return { get: async () => null, set: async () => {} };
	}
})();

const isMode = (value: string | null): value is ThemeMode =>
	value === 'light' || value === 'dark' || value === 'system';

// Non-secret preference stored in SecureStore because it is already installed;
// swap for AsyncStorage if more preferences appear.
// Renders nothing until the saved mode is read, so the splash (held by the root
// layout) covers the load and the themed tree never flashes the wrong scheme.
export function ThemeModeProvider({ children }: { children: ReactNode }) {
	const [mode, setModeState] = useState<ThemeMode | null>(null);
	const [, refresh] = useReducer((n: number) => n + 1, 0);
	const osScheme = useColorScheme();

	useEffect(() => {
		storage
			.get()
			.then((saved) => setModeState(isMode(saved) ? saved : 'system'))
			.catch(() => setModeState('system'));
	}, []);

	// Runs after GluestackUIProvider's own effect (child effects run first), which
	// calls Appearance.setColorScheme(mode) and passes the invalid "system".
	useEffect(() => {
		if (mode === null) return;
		if (mode === 'system') Appearance.setColorScheme('unspecified');
		// Appearance.setColorScheme updates RN state but react-native-css only learns
		// of it through an async native "change" event; set its observable directly
		// (react-native-css native/api.js colorScheme.set) so `dark:` and the
		// prefers-color-scheme token block flip in the same tick.
		cssColorScheme.set(
			mode === 'system' ? (Appearance.getColorScheme() ?? 'light') : mode
		);
		// useColorScheme may hold the previous value until the native event arrives.
		refresh();
	}, [mode]);

	const setMode = useCallback((next: ThemeMode) => {
		setModeState(next);
		storage.set(next).catch(() => {});
	}, []);

	const resolved = mode ?? 'system';
	const scheme: ThemeScheme =
		resolved === 'system' ? (osScheme === 'dark' ? 'dark' : 'light') : resolved;
	const value = useMemo(
		() => ({ mode: resolved, scheme, setMode }),
		[resolved, scheme, setMode]
	);

	if (mode === null) return null;
	return (
		<ThemeModeContext.Provider value={value}>
			{children}
		</ThemeModeContext.Provider>
	);
}

export function useThemeMode(): ThemeModeValue {
	const value = useContext(ThemeModeContext);
	if (!value)
		throw new Error('useThemeMode must be used inside ThemeModeProvider');
	return value;
}
