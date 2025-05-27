/**
 * Authentication middleware to protect routes
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ status: 'error', message: 'Authentication required' });
};

module.exports = isAuthenticated; 