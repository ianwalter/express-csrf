# @ianwalter/express-csrf
> Cross-Site Request Forgery (CSRF) middleware for [Express][expressUrl]

[![npm page][npmImage]][npmUrl]

## About

Heavily inspired by and based on [csurf][csurfUrl]. This module aims to be more
flexible than other CSRF modules by being split into two separate middleware:
one that handles the CSRF token generation and one that handles the CSRF token
validation.

## Installation

```console
yarn add @ianwalter/express-csrf
```

## Usage

Use the `csrfGeneration` middleware before you intend to use the
`req.generateCsrfToken` method to generate a CSRF token:

```js
const { csrfGeneration } = require('@ianwalter/express-csrf')

app.use(csrfGeneration)
```

Use the `csrfValidation` middleware before any endpoints you want to protect
from CSRF attacks:

```js
const { csrfValidation } = require('@ianwalter/express-csrf')

// Doesn't need to be proected:
app.post('/login', session.create)

app.use(csrfValidation)

// Protected:
app.post('/order', orders.create)
```

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[expressUrl]: https://expressjs.com/
[npmImage]: https://img.shields.io/npm/v/@ianwalter/express-csrf.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/express-csrf
[csurfUrl]: https://github.com/expressjs/csurf
[licenseUrl]: https://github.com/ianwalter/express-csrf/blob/master/LICENSE

