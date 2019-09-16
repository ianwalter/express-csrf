const { test } = require('@ianwalter/bff')
const express = require('express')
const session = require('express-session')
const request = require('supertest')
const { csrfGeneration, csrfValidation } = require('.')

const sessionMiddleware = session({
  secret: 'Booksmart Devil',
  resave: false,
  saveUninitialized: false
})
const errorMiddleware = (err, req, res, next) => {
  res.status(err.statusCode || 500).send(err.message)
}

test(
  'GET method is allowed to pass through without a CSRF header'
)(async ({ expect }) => {
  const app = express()
  const message = 'One chance to move you'
  app.use(sessionMiddleware)
  app.use(csrfGeneration)
  app.use(csrfValidation)
  app.get('/', (req, res) => res.json({ message }))
  app.use(errorMiddleware)
  const response = await request(app).get('/')
  expect(response.status).toBe(200)
  expect(response.body).toEqual({ message })
})

test(
  'POST method is not allowed to pass through without a CSRF header'
)(async ({ expect }) => {
  const app = express()
  app.use(sessionMiddleware)
  app.use(csrfGeneration)
  app.use(csrfValidation)
  app.get('/', (req, res) => res.status(204).end())
  app.use(errorMiddleware)
  const response = await request(app).post('/')
  expect(response.status).toBe(500)
  // expect(response.body).toBe("Invalid CSRF token ''") // FIXME:
})
