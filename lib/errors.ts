export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class PermissionDeniedError extends AppError {
  constructor(permission: string) {
    super("permission_denied", `Missing permission: ${permission}`, 403);
  }
}

export interface ErrorEnvelope {
  error: { code: string; message: string; requestId: string };
}

export function toErrorEnvelope(
  error: unknown,
  requestId: string,
): ErrorEnvelope {
  if (error instanceof AppError) {
    return { error: { code: error.code, message: error.message, requestId } };
  }
  return {
    error: {
      code: "internal_error",
      message: "Something went wrong.",
      requestId,
    },
  };
}
