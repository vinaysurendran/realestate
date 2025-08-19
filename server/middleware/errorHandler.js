// server/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging purposes
  console.error(err);

  // Determine the status code. If the error object has a statusCode, use it.
  // Otherwise, if the response statusCode is still the default 200, change it to 500.
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    // Only show the detailed error stack in development for security
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
