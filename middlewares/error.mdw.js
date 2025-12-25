import { redirectBack } from '../utils/redirect.js'

export function handleError(req, res, next) {
  res.error = function (message) {
    req.session.err_messages = Array.isArray(message) ? message : [message]
    return redirectBack(req, res)
  }
  next()
}
