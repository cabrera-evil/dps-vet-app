import { isAxiosError } from 'axios';

import type { ApiError } from '@/types/rest';

export interface ParsedApiError {
	/** HTTP status, undefined when the server was unreachable (network failure, timeout). */
	status?: number;
	message?: string;
	/** Per-field messages from the API `errors` envelope (first message per field). */
	fieldErrors: Record<string, string>;
}

export function parseApiError(error: unknown): ParsedApiError {
	if (!isAxiosError<ApiError>(error)) return { fieldErrors: {} };
	const body = error.response?.data;
	const fieldErrors: Record<string, string> = {};
	if (body?.errors && !Array.isArray(body.errors)) {
		for (const [field, messages] of Object.entries(body.errors)) {
			if (messages?.[0]) fieldErrors[field] = messages[0];
		}
	}
	return {
		status: error.response?.status,
		message: body?.message,
		fieldErrors,
	};
}
