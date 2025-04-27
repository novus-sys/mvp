import { useQuery, useMutation, QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from '@/components/ui/use-toast';

// Generic type for API responses
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

// Custom hook for data fetching with React Query
export function useApiQuery<TData, TError = AxiosError>(
  queryKey: QueryKey,
  queryFn: () => Promise<AxiosResponse<ApiResponse<TData>>>,
  options?: Omit<UseQueryOptions<AxiosResponse<ApiResponse<TData>>, TError, TData>, 'queryKey' | 'queryFn'> & {
    placeholderData?: TData;
  }
) {
  const { placeholderData, ...restOptions } = options || {};
  
  // Transform placeholderData to match the expected response format
  const transformedPlaceholderData = placeholderData
    ? {
        data: {
          data: placeholderData,
        },
      } as AxiosResponse<ApiResponse<TData>>
    : undefined;

  return useQuery<AxiosResponse<ApiResponse<TData>>, TError, TData>({
    queryKey,
    queryFn,
    select: (response) => response.data.data,
    placeholderData: transformedPlaceholderData,
    ...restOptions,
  });
}

// Custom hook for mutations with React Query
export function useApiMutation<TData, TVariables, TError = AxiosError>(
  mutationFn: (variables: TVariables) => Promise<AxiosResponse<ApiResponse<TData>>>,
  options?: UseMutationOptions<AxiosResponse<ApiResponse<TData>>, TError, TVariables>
) {
  return useMutation<AxiosResponse<ApiResponse<TData>>, TError, TVariables>({
    mutationFn,
    onSuccess: (response, variables, context) => {
      // Show success toast if there's a message
      if (response.data.message) {
        toast({
          title: 'Success',
          description: response.data.message,
        });
      }
      
      // Call the original onSuccess if provided
      options?.onSuccess?.(response, variables, context);
    },
    onError: (error: any, variables, context) => {
      // Show error toast
      const errorMessage = error.response?.data?.error || 'An error occurred';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      
      // Call the original onError if provided
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}
