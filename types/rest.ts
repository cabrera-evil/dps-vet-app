export type RequestParamValue = string | number | boolean | null | undefined;

export interface RequestParams {
	url: string;
	payload?: unknown;
	params?: Record<string, RequestParamValue>;
	headers?: Record<string, string>;
	signal?: AbortSignal;
}
