const authMiddleware = (requiredRole) => {
    return (req, res, next) => {
      if (requiredRole === 'customer') {
        if (!req.session.pnumber) {
          return res.redirect('/login');
        }
      } else if (requiredRole === 'product_manager' || requiredRole === 'website_administrator') {
        if (!req.session.admin || req.session.admin.role !== requiredRole) {
          return res.status(403).render('error', { message: 'Access Denied' });
        }
      } else if (requiredRole === 'any_admin') {
        if (!req.session.admin) {
          return res.status(403).render('error', { message: 'Access Denied' });
        }
      }
      next();
    };
  };

module.exports = authMiddleware;