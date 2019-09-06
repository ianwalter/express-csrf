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
const errorMiddleware = (req, res, next, err) => {
  res.status(err.statusCode || 500).end(err.message)
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
