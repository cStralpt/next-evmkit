import { queryClient } from "@/lib/clients";
import {
  type MutationFunction,
  type QueryKey,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export function useRQGlobalState<T>(key: QueryKey, defaultValue: T) {
  const { data } = useQuery({
    queryKey: key,
    queryFn: () => {
      const state = queryClient.getQueryData<T>(key);
      return state === undefined ? defaultValue : state;
    },
    initialData: defaultValue,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const { mutate: setState } = useMutation({
    mutationFn: ((newState: T) => {
      return Promise.resolve(queryClient.setQueryData(key, newState));
    }) as MutationFunction<T, T>,
  });

  return [data as T, setState] as const;
}
