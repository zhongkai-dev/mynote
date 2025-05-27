/**
 * Global error handling middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Set status code
  const statusCode = err.statusCode || 500;
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 