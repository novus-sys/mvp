import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/services/supabaseApi';
import { toast } from '@/components/ui/use-toast';

// Custom hook for Supabase queries
export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<ApiResponse<T>>,
  options?: Omit<UseQueryOptions<ApiResponse<T>, Error, T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ApiResponse<T>, Error, T>({
    queryKey,
    queryFn,
    select: (data) => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.data as T;
    },
    ...options,
  });
}

// Alternative version that accepts direct data return
export function useSupabaseDirectQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error, T>({
    queryKey,
    queryFn,
    ...options,
  });
}

// Custom mutation hook for Supabase
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<ApiResponse<TData>, Error, TVariables>({
    mutationFn,
    onError: (error, variables, context) => {
      // Default error handling
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred',
      });
      
      // Call the user-provided onError if it exists
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
}
