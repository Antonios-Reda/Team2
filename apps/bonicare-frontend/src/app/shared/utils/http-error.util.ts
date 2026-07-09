import { HttpErrorResponse } from '@angular/common/http';

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
  status: number;
}

const AUTH_MESSAGES: Record<number, string> = {
  401: 'Incorrect email or password. Please check your credentials and try again.',
  403: 'You do not have permission to access this account.',
  409: 'This email address is already registered. Please sign in or use a different email.',
  422: 'Please fix the highlighted fields and try again.',
};

export function parseApiError(error: HttpErrorResponse, context?: 'login' | 'signup'): ParsedApiError {
  const status = error.status;
  const body = error.error;
  const fieldErrors: Record<string, string> = {};

  if (body?.errors && Array.isArray(body.errors)) {
    for (const err of body.errors) {
      const field = err.field ?? err.path ?? 'form';
      fieldErrors[field] = err.message ?? err.msg;
    }
  }

  if (context === 'login' && status === 401) {
    return {
      message: AUTH_MESSAGES[401],
      fieldErrors: { password: 'The email or password you entered is incorrect.' },
      status,
    };
  }

  if (context === 'signup' && status === 409) {
    return {
      message: AUTH_MESSAGES[409],
      fieldErrors: { email: 'An account with this email already exists.' },
      status,
    };
  }

  if (status === 422 && Object.keys(fieldErrors).length > 0) {
    const first = Object.values(fieldErrors)[0];
    return { message: first ?? AUTH_MESSAGES[422], fieldErrors, status };
  }

  if (context === 'signup' && status === 422) {
    return {
      message: body?.message ?? AUTH_MESSAGES[422],
      fieldErrors,
      status,
    };
  }

  let message = body?.message ?? 'Something went wrong. Please try again.';

  if (message === 'Invalid credentials' || message === 'Incorrect email or password') {
    message = AUTH_MESSAGES[401];
  } else if (message === 'Email already registered' || message === 'This email address is already registered') {
    message = AUTH_MESSAGES[409];
  } else if (message === 'Missing fields') {
    message = context === 'login'
      ? 'Please enter both your email and password.'
      : 'Please fill in all required fields.';
  } else if (message === 'Validation Error') {
    message = Object.values(fieldErrors)[0] ?? AUTH_MESSAGES[422];
  } else if (message === 'Unauthorized' || messageIdUnauthorized(body)) {
    message = AUTH_MESSAGES[401];
  }

  if (AUTH_MESSAGES[status] && (status === 403 || status === 409)) {
    message = AUTH_MESSAGES[status];
  }

  return { message, fieldErrors, status };
}

function messageIdUnauthorized(body: { messageId?: string; message?: string } | null): boolean {
  return body?.messageId === 'auth.unauthorized' || body?.message === 'Unauthorized';
}

export function getFieldError(
  fieldErrors: Record<string, string>,
  field: string,
  touched: boolean,
  validationMessage?: string
): string | undefined {
  if (fieldErrors[field]) return fieldErrors[field];
  if (touched && validationMessage) return validationMessage;
  return undefined;
}
