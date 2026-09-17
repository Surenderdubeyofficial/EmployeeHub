export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Authentication is required");
      error.statusCode = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("You are not allowed to access this resource");
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
};
