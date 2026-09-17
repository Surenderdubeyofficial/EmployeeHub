import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Authentication token is required");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    const error = new Error("Authenticated user no longer exists");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "inactive") {
    const error = new Error("Account is inactive");
    error.statusCode = 403;
    throw error;
  }

  req.user = user;
  next();
});
