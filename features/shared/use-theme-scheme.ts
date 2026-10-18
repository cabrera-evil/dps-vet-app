import { useThemeMode } from './theme-mode';

// Effective scheme: an explicit light/dark choice wins, "system" follows the OS.
export function useThemeScheme(): 'light' | 'dark' {
	return useThemeMode().scheme;
}
