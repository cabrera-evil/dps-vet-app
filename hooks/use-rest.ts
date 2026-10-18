import { create, list, remove, update } from '@/lib/rest';
import type { RequestParams } from '@/types/rest';
import {
	type UseMutationOptions,
	type UseQueryOptions,
	useMutation,
	useQuery,
} from '@tanstack/react-query';

type QueryKey = readonly ['rest', RequestParams];
type QueryOptions<T> = Omit<
	UseQueryOptions<T, Error, T, QueryKey>,
	'queryKey' | 'queryFn'
>;
type MutationOptions<T> = UseMutationOptions<T, Error, RequestParams>;

export function useGet<T>(
	requestParams: RequestParams,
	options?: QueryOptions<T>
) {
	return useQuery<T, Error, T, QueryKey>({
		queryKey: ['rest', requestParams],
		queryFn: ({ signal }) => list<T>({ ...requestParams, signal }),
		...options,
	});
}

export function usePost<T>(options?: MutationOptions<T>) {
	return useMutation<T, Error, RequestParams>({
		mutationFn: create<T>,
		...options,
	});
}

export function usePatch<T>(options?: MutationOptions<T>) {
	return useMutation<T, Error, RequestParams>({
		mutationFn: update<T>,
		...options,
	});
}

export function useDelete<T>(options?: MutationOptions<T>) {
	return useMutation<T, Error, RequestParams>({
		mutationFn: remove<T>,
		...options,
	});
}
