const Tokens = require('csrf')
const BaseError = require('@ianwalter/base-error')

const ignoredMethods = ['GET', 'HEAD', 'OPTIONS']
const tokens = new Tokens()

class InvalidCsrfTokenError extends BaseError {
  constructor (token) {
    super(`Invalid CSRF token ${token}`)
  }
}

function csrfGeneration (req, res, next) {
  let secret = req.session.csrfSecret
  let token

  req.generateCsrfToken = () => {
    // Use the cached token if the secret hasn't changed.
    if (token && secret === req.session.csrfSecret) {
      return token
    }

    // Generate a new secret if there isn't one stored in the session.
    if (req.session.csrfSecret === undefined) {
      req.session.csrfSecret = tokens.secretSync()
    }

    // Update the cached secret with the secret in the session.
    secret = req.session.csrfSecret

    // Update the cached token by generating a new one and return it.
    token = tokens.create(secret)
    return token
  }

  // If there is no cached secret, generate a new one and add it to the session.
  if (!secret) {
    secret = tokens.secretSync()
    req.session.csrfSecret = secret
  }

  // Continue to the next middleware.
  next()
}

function csrfValidation (req, res, next) {
  const secret = req.session.csrfSecret
  const token = req.headers['csrf-token']
  if (ignoredMethods.includes(req.method) || tokens.verify(secret, token)) {
    // Continue to the next middleware if the request is using a method that
    // isn't vulnerable to a CSRF attack or if the CSRF token contained in the
    // header matches the CSRF secret stored in the session.
    next()
  } else {
    // If the CSRF token contained in the request header doesn't match the CSRF
    // secret stored in the session, pass the InvalidCsrfTokenError to the next
    // error-handling middleware.
    next(new InvalidCsrfTokenError(token))
  }
}

module.exports = { csrfGeneration, csrfValidation, InvalidCsrfTokenError }
