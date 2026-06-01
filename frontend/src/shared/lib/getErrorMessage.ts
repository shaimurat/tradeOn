export function getErrorMessage(error: unknown) {
  const fallback = 'Что-то пошло не так';

  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const maybeAxiosError = error as {
    response?: {
      data?: {
        error?: {
          message?: string;
          fields?: Record<string, string>;
        };
        message?: string;
      };
    };
    message?: string;
  };

  const fields = maybeAxiosError.response?.data?.error?.fields;

  if (fields && Object.keys(fields).length > 0) {
    return Object.values(fields).join(', ');
  }

  return (
    maybeAxiosError.response?.data?.error?.message ||
    maybeAxiosError.response?.data?.message ||
    maybeAxiosError.message ||
    fallback
  );
}