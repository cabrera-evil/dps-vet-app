import { DarkTheme, DefaultTheme } from 'expo-router';

// JS mirror of the global.css tokens, for APIs that cannot take classNames
// (navigator theme, tab bar tint). Keep in sync with global.css.
export const navigationTokens = {
	light: {
		background: 'rgb(248 250 252)',
		card: 'rgb(255 255 255)',
		foreground: 'rgb(15 23 42)',
		border: 'rgb(226 232 240)',
		primary: 'rgb(15 118 110)',
		mutedForeground: 'rgb(90 106 129)',
	},
	dark: {
		background: 'rgb(2 6 23)',
		card: 'rgb(15 23 42)',
		foreground: 'rgb(241 245 249)',
		border: 'rgb(51 65 85)',
		primary: 'rgb(44 212 191)',
		mutedForeground: 'rgb(148 163 184)',
	},
} as const;

export const getNavigationTheme = (scheme: 'light' | 'dark') => {
	const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
	const tokens = navigationTokens[scheme];
	return {
		...base,
		colors: {
			...base.colors,
			background: tokens.background,
			card: tokens.card,
			text: tokens.foreground,
			border: tokens.border,
			primary: tokens.primary,
		},
	};
};
