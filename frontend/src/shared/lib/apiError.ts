import axios from 'axios';

export type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
};

export type ParsedApiError = {
  code: string;
  message: string;
  fields: Record<string, string>;
};

const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Проверьте правильность заполнения полей',
  INVALID_JSON: 'Некорректный формат запроса',
  INVALID_INPUT: 'Некорректные данные',
  INVALID_CREDENTIALS: 'Неверный email или пароль',
  UNAUTHORIZED: 'Необходимо авторизоваться',
  FORBIDDEN: 'Недостаточно прав',
  INVALID_TOKEN: 'Некорректный токен',
  TOKEN_EXPIRED: 'Срок действия токена истек',
  NOT_FOUND: 'Ресурс не найден',
  ALREADY_EXISTS: 'Такая запись уже существует',
  DUPLICATE_VALUE: 'Такое значение уже используется',
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',
};

const fieldMessages: Record<string, string> = {
  'field is required': 'Поле обязательно',
  'invalid email format': 'Некорректный email',
  'field is too short': 'Слишком короткое значение',
  'field is too long': 'Слишком длинное значение',
  'invalid value': 'Некорректное значение',
  'invalid url': 'Некорректная ссылка',
  'invalid field': 'Некорректное поле',
};

export function parseApiError(error: unknown, fallbackMessage = 'Произошла ошибка'): ParsedApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      code: 'UNKNOWN_ERROR',
      message: fallbackMessage,
      fields: {},
    };
  }

  const apiError = error.response?.data?.error;

  if (!apiError) {
    return {
      code: 'UNKNOWN_ERROR',
      message: fallbackMessage,
      fields: {},
    };
  }

  const code = apiError.code ?? 'UNKNOWN_ERROR';

  const fields = Object.entries(apiError.fields ?? {}).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[key] = fieldMessages[value] ?? value;
      return acc;
    },
    {}
  );

  return {
    code,
    message: errorMessages[code] ?? apiError.message ?? fallbackMessage,
    fields,
  };
}