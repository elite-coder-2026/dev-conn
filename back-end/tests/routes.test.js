'use strict'

process.env.BCRYPT_ROUNDS = '4'
process.env.JWT_SECRET = 'test-secret-that-is-well-over-32-characters-long'
process.env.NODE_ENV = 'production'

const request = require('supertest')
const jwt     = require('jsonwebtoken')

jest.mock('../src/db', () => ({ query: jest.fn(), connect: jest.fn() }))

const AUTHED_USER = 'user-self'
const OTHER_USER  = 'user-other'
const token  = () => jwt.sign({ sub: AUTHED_USER, handle: '@self' }, process.env.JWT_SECRET)
const cookie = () => [`token=${token()}`]

let db
let app

// A fake pooled client for services that use pool.connect() + transactions.
function fakeClient(queryImpl) {
  return { query: jest.fn(queryImpl), release: jest.fn() }
}

// Mutable per-test knobs consulted by the shared db.query mock.
let state

beforeEach(() => {
  jest.resetModules()
  jest.mock('../src/db', () => ({ query: jest.fn(), connect: jest.fn() }))
  db = require('../src/db')

  state = { rows: [], rowCount: 0 }

  // One implementation for the whole suite: satisfy requireAuth's user lookup
  // (it now checks password_changed_at), and return `state` for everything else.
  db.query.mockImplementation(async (text) => {
    const t = String(text).replace(/\s+/g, ' ').trim()
    if (t.startsWith('SELECT password_changed_at FROM users WHERE id')) {
      return { rows: [{ password_changed_at: null }] }
    }
    return state
  })
  db.connect.mockResolvedValue(fakeClient(async () => ({ rows: [], rowCount: 0 })))
  app = require('./helpers/fullApp')()
})

// ── Auth is required on every mutating / private route ───────────────────────
describe('routes reject unauthenticated access with 401', () => {
  const guarded = [
    ['get',    '/api/users/me'],
    ['get',    '/api/users/search?q=a'],
    ['put',    '/api/users/me'],
    ['delete', '/api/users/me'],
    ['post',   '/api/users/'],
    ['get',    '/api/users/some-id'],          // B1 regression: used to be public
    ['get',    '/api/feed/'],
    ['get',    '/api/feed/components'],
    ['get',    '/api/feed/users/x'],
    ['get',    '/api/posts/x'],
    ['post',   '/api/posts/'],
    ['put',    '/api/posts/x'],
    ['delete', '/api/posts/x'],
    ['post',   '/api/posts/x/like'],
    ['post',   '/api/posts/x/comments'],
    ['get',    '/api/contacts/following'],
    ['post',   '/api/contacts/x/follow'],
    ['get',    '/api/connections/friends'],
    ['post',   '/api/connections/requests'],
    ['post',   '/api/connections/requests/x/accept'],
    ['post',   '/api/dm/conversations'],
    ['get',    '/api/dm/inbox'],
    ['post',   '/api/dm/conversations/x/messages'],
    ['delete', '/api/dm/messages/x'],
    ['get',    '/api/notifications/'],
    ['patch',  '/api/notifications/read-all'],
    ['get',    '/api/videos/'],
    ['post',   '/api/videos/'],
    ['put',    '/api/videos/x'],
    ['delete', '/api/videos/x'],
  ]

  test.each(guarded)('%s %s -> 401 without a token', async (method, path) => {
    const res = await request(app)[method](path).send({})
    expect(res.status).toBe(401)
  })
})

// ── B1: password hash must never leave the API ──────────────────────────────
describe('GET /api/users/:id (B1)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/users/abc')
    expect(res.status).toBe(401)
  })

  test('with a token, never returns password_hash / password_changed_at', async () => {
    state = { rows: [{
      id: OTHER_USER, name: 'Other', handle: 'other', avatar_url: null, cover_color: null,
      is_online: false, created_at: new Date(),
      password_hash: '$2b$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      password_changed_at: new Date(),
      posts_count: 0, followers_count: 0, following_count: 0,
    }] }
    const res = await request(app).get(`/api/users/${OTHER_USER}`).set('Cookie', cookie())
    expect(res.status).toBe(200)
    expect(res.body).not.toHaveProperty('password_hash')
    expect(res.body).not.toHaveProperty('password_changed_at')
    expect(JSON.stringify(res.body)).not.toContain('$2b$')
  })
})

// ── IDOR: mutating another user's resource is forbidden ─────────────────────
describe('ownership is enforced on updates/deletes', () => {
  test('PUT /api/posts/:id by a non-author -> 403', async () => {
    db.connect.mockResolvedValue(fakeClient(async (sql) => {
      if (/BEGIN|COMMIT|ROLLBACK/.test(sql)) return {}
      return { rows: [{ author_id: OTHER_USER }] }
    }))
    const res = await request(app).put('/api/posts/post-1')
      .set('Cookie', cookie()).send({ content: 'hijack' })
    expect(res.status).toBe(403)
  })

  test('DELETE /api/posts/:id by a non-author -> 403', async () => {
    db.connect.mockResolvedValue(fakeClient(async (sql) => {
      if (/BEGIN|COMMIT|ROLLBACK/.test(sql)) return {}
      return { rows: [{ author_id: OTHER_USER }] }
    }))
    const res = await request(app).delete('/api/posts/post-1').set('Cookie', cookie())
    expect(res.status).toBe(403)
  })

  test('DELETE /api/posts/:id/comments/:commentId by a non-author -> 403', async () => {
    db.connect.mockResolvedValue(fakeClient(async (sql) => {
      if (/BEGIN|COMMIT|ROLLBACK/.test(sql)) return {}
      return { rows: [{ author_id: OTHER_USER }] }
    }))
    const res = await request(app).delete('/api/posts/post-1/comments/c-1').set('Cookie', cookie())
    expect(res.status).toBe(403)
  })

  test('POST /api/dm/conversations/:id/messages by a non-participant -> 403', async () => {
    state = { rows: [] } // isParticipant lookup returns nothing
    const res = await request(app).post('/api/dm/conversations/conv-1/messages')
      .set('Cookie', cookie()).send({ body: 'let me in' })
    expect(res.status).toBe(403)
  })

  test('GET /api/dm/conversations/:id/messages by a non-participant -> 403', async () => {
    state = { rows: [] }
    const res = await request(app).get('/api/dm/conversations/conv-1/messages').set('Cookie', cookie())
    expect(res.status).toBe(403)
  })
})

// ── Input validation on the connection graph ────────────────────────────────
describe('connection request validation', () => {
  test('POST /api/connections/requests with no recipient_id -> 400', async () => {
    const res = await request(app).post('/api/connections/requests').set('Cookie', cookie()).send({})
    expect(res.status).toBe(400)
  })

  test('POST /api/connections/requests to yourself -> 400', async () => {
    const res = await request(app).post('/api/connections/requests')
      .set('Cookie', cookie()).send({ recipient_id: AUTHED_USER })
    expect(res.status).toBe(400)
  })
})

// ── DM body limits ─────────────────────────────────────────────────────────
describe('DM message validation', () => {
  test('empty body -> 400', async () => {
    state = { rows: [{ user_id: AUTHED_USER }] } // is a participant
    const res = await request(app).post('/api/dm/conversations/conv-1/messages')
      .set('Cookie', cookie()).send({ body: '   ' })
    expect(res.status).toBe(400)
  })

  test('body over 5000 chars -> 400', async () => {
    state = { rows: [{ user_id: AUTHED_USER }] }
    const res = await request(app).post('/api/dm/conversations/conv-1/messages')
      .set('Cookie', cookie()).send({ body: 'x'.repeat(5001) })
    expect(res.status).toBe(400)
  })
})
