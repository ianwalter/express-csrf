const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const { createExpressServer } = require('@ianwalter/test-server')
const session = require('express-session')
const { csrfGeneration, csrfValidation, setLogLevel } = require('.')

const sessionMiddleware = session({
  secret: 'Booksmart Devil',
  resave: false,
  saveUninitialized: false
})

// Set CSRF middleware log level to debug.
setLogLevel('debug')

test(
  'GET method is allowed to pass through without a CSRF header'
)(async ({ expect }) => {
  const server = await createExpressServer()
  const message = 'One chance to move you'
  server.use(sessionMiddleware)
  server.use(csrfGeneration)
  server.use(csrfValidation)
  server.get('/', (req, res) => res.json({ message }))
  const response = await requester.get(server.url)
  expect(response.statusCode).toBe(200)
  expect(response.body.message).toBe(message)
  await server.close()
})

test.skip(
  'POST method is not allowed to pass through without a CSRF header'
)(async ({ expect }) => {
  const server = await createExpressServer()
  server.use(sessionMiddleware)
  server.use(csrfGeneration)
  server.use(csrfValidation)
  server.post('/', (req, res) => res.status(204).end())
  server.useErrorMiddleware()
  const response = await requester.post(server.url)
  expect(response.statusCode).toBe(401)
  await server.close()
})

test(
  'POST method is allowed to pass through with a valid CSRF header'
)(async ({ expect }) => {
  const server = await createExpressServer()
  const message = "What's tne scoop, Cook?"
  server.use(sessionMiddleware)
  server.use(csrfGeneration)
  server.use(csrfValidation)
  server.get('/', (req, res) => {
    res.json({ csrfToken: req.generateCsrfToken() })
  })
  server.post('/message', (req, res) => res.status(201).json({ message }))
  server.useErrorMiddleware()
  let response = await requester.get(server.url)
  const headers = {
    'csrf-token': response.body.csrfToken,
    cookie: response.headers['set-cookie']
  }
  const options = { headers, body: { message } }
  response = await requester.post(`${server.url}/message`, options)
  expect(response.statusCode).toBe(201)
  expect(response.body.message).toBe(message)
})
