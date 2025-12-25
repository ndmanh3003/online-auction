export function isAuth(req, res, next) {
  if (!req.session.isAuthenticated) {
    req.session.retUrl = req.originalUrl
    return res.redirect('/auth/login')
  }

  next()
}

export function isAdmin(req, res, next) {
  if (req.session.authUser?.role !== 'admin') {
    return res.render('403')
  }
  next()
}

export function canCreateProduct(req, res, next) {
  const user = req.session.authUser
  if (user?.role === 'admin') {
    return next()
}
  if (!user?.sellerExpiresAt || new Date() > new Date(user.sellerExpiresAt)) {
    return res.error(
      'Your seller permission has expired. You can no longer create new products.'
    )
  }
  next()
}
