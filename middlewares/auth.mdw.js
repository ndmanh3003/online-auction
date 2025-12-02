export function isAuth(req, res, next) {
  if (!req.session.isAuthenticated) {
    req.session.retUrl = req.originalUrl;
    return res.redirect('/auth/login');
  }

  next();
}

export function isAdmin(req, res, next) {
  if (req.session.authUser?.role !== 'admin') {
    return res.render('403');
  }

  next();
}

export function isSeller(req, res, next) {
  if (req.session.authUser?.role !== 'seller' && req.session.authUser?.role !== 'admin') {
    return res.render('403');
  }

  next();
}