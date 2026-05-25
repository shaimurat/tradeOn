import axios from 'axios';

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: ApiError } | undefined;

    if (data?.error) {
      return data.error;
    }

    return {
      code: 'HTTP_ERROR',
      message: error.message || 'Request failed',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unexpected error',
  };
}