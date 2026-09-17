import { sendError } from "../utils/apiResponse.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((item) => item.message);
    return sendError(res, "Validation failed", 400, errors);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    return sendError(res, `${field} already exists`, 409);
  }

  if (error.name === "CastError") {
    return sendError(res, "Invalid resource id", 400);
  }

  if (error.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }

  if (error.name === "TokenExpiredError") {
    return sendError(res, "Token expired", 401);
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return sendError(res, "Uploaded file is too large", 400);
  }

  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Server error"
      : error.message || "Server error";

  return sendError(res, message, statusCode);
};
