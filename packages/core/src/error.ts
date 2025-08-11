type ErrorType =
  | "validation"
  | "authentication"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "internal";

export const errorCodes = {
  validation: {
    INVALID_STATE: "invalid_state",
  },
  notFound: {
    RESOURCE_NOT_FOUND: "resource_not_found",
  },
  authentication: {
    UNAUTHORIZED: "unauthorized",
  },
};

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public code: string,
    public message: string,
  ) {
    super(message);
  }
}
