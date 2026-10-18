export type RequestParamValue = string | number | boolean | null | undefined;

export interface RequestParams {
	url: string;
	payload?: unknown;
	params?: Record<string, RequestParamValue>;
	headers?: Record<string, string>;
	signal?: AbortSignal;
}

export interface Pagination {
	page: number;
	pageSize: number;
	total: number;
	pageCount: number;
}

/** Success envelope returned by the dps-vet-web API. */
export interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
	pagination?: Pagination;
}

/** Error envelope returned by the dps-vet-web API. */
export interface ApiError {
	statusCode: number;
	message: string;
	errors?: Record<string, string[]> | string[];
}

/** Returns the bearer token to attach to requests, or none to send no Authorization header. */
export type TokenProvider = () =>
	Promise<string | null | undefined> | string | null | undefined;

/**
 * Invoked when the API answers 401 on a non-auth endpoint. `retried` is true when the
 * request was already replayed once. Resolve to `true` to replay the request (once).
 */
export type UnauthorizedHandler = (
	error: unknown,
	retried: boolean
) => Promise<boolean | void> | boolean | void;
