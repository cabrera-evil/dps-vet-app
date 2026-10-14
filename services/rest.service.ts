import axios, {
	type AxiosError,
	type AxiosInstance,
	type InternalAxiosRequestConfig,
} from 'axios';
import dayjs from 'dayjs';

import { getApiBaseUrl } from '@/lib/env';
import { getStoredToken } from '@/lib/token-store';
import type { RequestParams, TokenProvider, UnauthorizedHandler } from '@/types/rest';

const SENSITIVE_KEY = /authorization|token|secret|password|api[._-]?key/i;
const requestStartTimes = new WeakMap<object, number>();

function redact(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(redact);
	if (!value || typeof value !== 'object') return value;

	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
			key,
			SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(entry),
		])
	);
}

function toDebugJson(value: unknown): string {
	try {
		return JSON.stringify(redact(value), null, 2);
	} catch {
		return '[Unserializable REST log payload]';
	}
}

export class RestService {
	private static instance: RestService | undefined;
	private readonly client: AxiosInstance;
	private tokenProvider: TokenProvider = getStoredToken;
	// ponytail: 401 is only reported, no refresh yet (Phase 2).
	private unauthorizedHandler: UnauthorizedHandler = () => {};

	private constructor() {
		this.client = axios.create({ baseURL: getApiBaseUrl() });
		this.setupAuth();
		this.setupDevelopmentLogger();
	}

	setTokenProvider(provider: TokenProvider): void {
		this.tokenProvider = provider;
	}

	setUnauthorizedHandler(handler: UnauthorizedHandler): void {
		this.unauthorizedHandler = handler;
	}

	private setupAuth(): void {
		this.client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
			const token = await this.tokenProvider();
			if (token) config.headers.set('Authorization', `Bearer ${token}`);
			return config;
		});

		this.client.interceptors.response.use(undefined, (error: AxiosError) => {
			if (error.response?.status === 401) this.unauthorizedHandler(error);
			return Promise.reject(error);
		});
	}

	static getInstance(): RestService {
		this.instance ??= new RestService();
		return this.instance;
	}

	private setupDevelopmentLogger(): void {
		if (!__DEV__) return;

		this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
			requestStartTimes.set(config, dayjs().valueOf());
			// eslint-disable-next-line no-console
			console.debug(
				'[REST request]',
				toDebugJson({
					method: config.method?.toUpperCase(),
					url: config.url,
					params: config.params,
					data: config.data,
				})
			);
			return config;
		});

		this.client.interceptors.response.use(
			(response) => {
				const durationMs =
					dayjs().valueOf() -
					(requestStartTimes.get(response.config) ?? dayjs().valueOf());
				// eslint-disable-next-line no-console
				console.debug(
					'[REST response]',
					toDebugJson({
						method: response.config.method?.toUpperCase(),
						url: response.config.url,
						status: response.status,
						durationMs,
						data: response.data,
					})
				);
				return response;
			},
			(error: AxiosError) => {
				const durationMs = error.config
					? dayjs().valueOf() -
						(requestStartTimes.get(error.config) ?? dayjs().valueOf())
					: undefined;
				// eslint-disable-next-line no-console
				console.debug(
					'[REST response error]',
					toDebugJson({
						method: error.config?.method?.toUpperCase(),
						url: error.config?.url,
						status: error.response?.status,
						durationMs,
						data: error.response?.data,
					})
				);
				return Promise.reject(error);
			}
		);
	}

	create<T>({ url, payload, params, headers, signal }: RequestParams): Promise<T> {
		return this.client.post<T>(url, payload, { params, headers, signal }).then(({ data }) => data);
	}

	list<T>({ url, params, headers, signal }: RequestParams): Promise<T> {
		return this.client.get<T>(url, { params, headers, signal }).then(({ data }) => data);
	}

	update<T>({ url, payload, params, headers, signal }: RequestParams): Promise<T> {
		return this.client.patch<T>(url, payload, { params, headers, signal }).then(({ data }) => data);
	}

	remove<T>({ url, params, headers, signal }: RequestParams): Promise<T> {
		return this.client.delete<T>(url, { params, headers, signal }).then(({ data }) => data);
	}
}
