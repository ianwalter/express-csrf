# @ianwalter/express-csrf
> Cross-Site Request Forgery (CSRF) middleware for [Express][expressUrl]

## About

Heavily inspired by and based on [csurf][csurfUrl]. This module aims to be more
flexible than other CSRF modules by being split into two separate middleware:
one that handles the CSRF token generation and one that handles the CSRF token
validation.

[expressUrl]: https://expressjs.com/
[csurfUrl]: https://github.com/expressjs/csurf

