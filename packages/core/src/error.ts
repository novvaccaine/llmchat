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
    INVALID_PARAMETERS: "invalid_parameters",
  },
  notFound: {
    RESOURCE_NOT_FOUND: "resource_not_found",
    API_KEY_NOT_FOUND: "api_key_not_found",
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
