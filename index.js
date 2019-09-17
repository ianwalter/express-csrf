const { Print } = require('@ianwalter/print')
const Tokens = require('csrf')
const BaseError = require('@ianwalter/base-error')

const ignoredMethods = ['GET', 'HEAD', 'OPTIONS']
const tokens = new Tokens()

class InvalidCsrfError extends BaseError {
  constructor (token) {
    super(`Invalid CSRF token '${token || ''}'`)
    this.statusCode = 401
  }
}

let print = new Print({ level: 'info' })

const csrfGeneration = (req, res, next) => {
  req.generateCsrfToken = () => {
    //
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync()
    }

    //
    const token = tokens.create(req.session.csrfSecret)

    // Output the created secret and CSRF token for debugging purposes.
    const secret = req.session.csrfSecret
    print.debug(`Created CSRF secret '${secret}' and token '${token}'`)

    //
    return token
  }

  // Continue to the next middleware.
  next()
}

const csrfValidation = (req, res, next) => {
  const secret = req.session.csrfSecret
  const token = req.headers['csrf-token']
  if (ignoredMethods.includes(req.method) || tokens.verify(secret, token)) {
    // Continue to the next middleware if the request is using a method that
    // isn't vulnerable to a CSRF attack or if the CSRF token contained in the
    // header matches the CSRF secret stored in the session.
    next()
  } else {
    // Output the mismatched secret and token for debugging purposes.
    print.debug(`CSRF secret '${secret}' and token '${token}' mismatch`)

    // If the CSRF token contained in the request header doesn't match the
    // CSRF secret stored in the session, pass the InvalidCsrfError to the
    // next error-handling middleware.
    next(new InvalidCsrfError(token))
  }
}

function setLogLevel (level) {
  print = new Print({ level })
}

module.exports = {
  InvalidCsrfError,
  csrfGeneration,
  csrfValidation,
  setLogLevel
}
