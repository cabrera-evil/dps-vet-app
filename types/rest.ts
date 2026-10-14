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
	totalPages: number;
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
export type TokenProvider = () => Promise<string | null | undefined> | string | null | undefined;

/** Invoked when the API answers 401. */
export type UnauthorizedHandler = (error: unknown) => void;
