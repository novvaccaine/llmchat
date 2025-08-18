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
  rateLimit: {
    RESOURCE_EXHAUSTED: "resource_exhaused",
  },
  authentication: {
    UNAUTHORIZED: "unauthorized",
  },
  internal: {
    DEPENDENCY_FAILURE: "dependency_failure",
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

  statusCode() {
    switch (this.type) {
      case "validation":
        return 400;
      case "authentication":
        return 401;
      case "forbidden":
        return 403;
      case "not_found":
        return 404;
      case "rate_limit":
        return 429;
      case "internal":
        return 500;
    }
  }
}
