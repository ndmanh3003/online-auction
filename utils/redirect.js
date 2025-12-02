export function redirectBack(req, res, fallback = '/') {
  const referer = req.get('Referer') || req.get('referer');
  if (referer) {
    return res.redirect(referer);
  }
  return res.redirect(fallback);
}
