'use strict'
// Shared test harness: mounts the full API with a SQL-routing db mock so each
// domain suite can script query results by matching on a fragment of the SQL.

process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4'
process.env.JWT_SECRET = 'test-secret-that-is-well-over-32-characters-long'
process.env.NODE_ENV = 'production'

const jwt = require('jsonwebtoken')

const SELF = 'user-self'
const norm = s => String(s).replace(/\s+/g, ' ').trim()

function makeHarness() {
  jest.resetModules()
  jest.mock('../../src/db', () => ({ query: jest.fn(), connect: jest.fn() }))
  const db = require('../../src/db')

  const routes = []

  function replyFor(text, params) {
    const t = norm(text)
    if (t.startsWith('SELECT password_changed_at FROM users WHERE id')) {
      return { rows: [{ password_changed_at: null }] }
    }
    for (const r of routes) {
      if (t.includes(norm(r.match))) {
        const out = typeof r.reply === 'function' ? r.reply(params, t) : r.reply
        return out ?? { rows: [], rowCount: 0 }
      }
    }
    return { rows: [], rowCount: 0 }
  }

  db.query.mockImplementation(async (text, params) => replyFor(text, params))
  db.connect.mockImplementation(async () => ({
    query: jest.fn(async (text, params) => {
      if (/^(BEGIN|COMMIT|ROLLBACK)/.test(norm(text))) return {}
      return replyFor(text, params)
    }),
    release: jest.fn(),
  }))

  const app = require('./fullApp')()

  return {
    app,
    db,
    self: SELF,
    cookie: () => [`token=${jwt.sign({ sub: SELF, handle: '@self' }, process.env.JWT_SECRET)}`],
    // Register a canned result for any query whose SQL contains `match`.
    when(match, reply) { routes.push({ match, reply }); return this },
  }
}

module.exports = { makeHarness, SELF }
