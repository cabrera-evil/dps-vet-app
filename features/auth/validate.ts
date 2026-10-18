import type { ZodType } from 'zod';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Validates form values; returns the parsed data or the first message per field. */
export function validateForm<T>(
	schema: ZodType<T>,
	values: unknown
):
	| { data: T; errors?: undefined }
	| { data?: undefined; errors: FieldErrors<T> } {
	const parsed = schema.safeParse(values);
	if (parsed.success) return { data: parsed.data };
	const errors: FieldErrors<T> = {};
	for (const issue of parsed.error.issues) {
		const field = issue.path[0] as keyof T;
		errors[field] ??= issue.message;
	}
	return { errors };
}

/** Generic Spanish message for a failed auth request, by HTTP status (undefined = unreachable). */
export function requestErrorMessage(status?: number): string {
	if (status === undefined)
		return 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.';
	if (status === 429)
		return 'Demasiados intentos. Inténtalo de nuevo más tarde.';
	return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
