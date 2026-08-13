/**
 * errorHandler.js — Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.name || 'UnknownError', err.message);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      type: err.name || 'ServerError',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

export default errorHandler;
