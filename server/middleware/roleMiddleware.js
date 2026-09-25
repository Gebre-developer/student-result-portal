/**
 * Role-Based Authorization Middleware Guard
 * @param {...String} allowedRoles - Restrict access exclusively to these specific roles (e.g., 'admin')
 */
module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    // 1. Safety check to ensure authMiddleware has already verified the token identity
    if (!req.user) {
      return res.status(500).json({
        message:
          "Authorization guard failure: User identity missing from runtime thread.",
      });
    }

    // 2. Evaluate if the authenticated user's role exists within the permitted roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access forbidden: Your account role (${req.user.role}) is unauthorized to access this admin route.`,
      });
    }

    // 3. If authenticated role matches permitted dimensions, advance execution to the next controller route callback
    next();
  };
};
