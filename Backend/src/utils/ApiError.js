/**
 * Custom error carrying an HTTP status code, a machine-readable code and
 * optional field-level details. Thrown from controllers/services and
 * turned into a consistent JSON shape by middleware/errorHandler.js.
 */
class ApiError extends Error {
  constructor(statusCode, message, code = "ERROR", details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details = null) {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have permission to do this") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message = "Resource already exists", details = null) {
    return new ApiError(409, message, "CONFLICT", details);
  }

  static tooMany(message = "Too many requests, please try again later") {
    return new ApiError(429, message, "TOO_MANY_REQUESTS");
  }

  static internal(message = "Something went wrong") {
    return new ApiError(500, message, "INTERNAL_ERROR");
  }
}

module.exports = ApiError;
