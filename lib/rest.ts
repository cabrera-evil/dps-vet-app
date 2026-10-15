import { RestService } from '@/services/rest.service';
import type { RequestParams, TokenProvider, UnauthorizedHandler } from '@/types/rest';

const restService = RestService.getInstance();

export const create = <T>(params: RequestParams): Promise<T> => restService.create<T>(params);
export const list = <T>(params: RequestParams): Promise<T> => restService.list<T>(params);
export const update = <T>(params: RequestParams): Promise<T> => restService.update<T>(params);
export const remove = <T>(params: RequestParams): Promise<T> => restService.remove<T>(params);

export const setTokenProvider = (provider: TokenProvider): void =>
	restService.setTokenProvider(provider);
export const setUnauthorizedHandler = (handler: UnauthorizedHandler): void =>
	restService.setUnauthorizedHandler(handler);
