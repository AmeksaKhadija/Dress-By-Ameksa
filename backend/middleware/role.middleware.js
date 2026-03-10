const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le role ${req.user.role} n'est pas autorise a acceder a cette ressource`,
      });
    }
    next();
  };
};

module.exports = authorize;
