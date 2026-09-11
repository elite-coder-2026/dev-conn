'use strict'

// Fast, deterministic bcrypt for tests. Set before any module reads it
// (authService derives DUMMY_HASH from this at load time).
process.env.BCRYPT_ROUNDS = '4'
process.env.JWT_SECRET = 'test-secret-that-is-well-over-32-characters-long'
process.env.NODE_ENV = 'production'

const path     = require('path')
const request  = require('supertest')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')

// Every service reaches the DB through this module — replace it with a spy.
jest.mock('../src/db', () => ({ query: jest.fn() }))

const KNOWN_HANDLE   = 'alexrivera'
const KNOWN_PASSWORD = 'correct-horse'
let KNOWN_HASH
let passwordChangedAt // value the mock returns for users.password_changed_at

function routeMockImpl(text, params) {
  const t = text.replace(/\s+/g, ' ').trim()

  if (t.startsWith('SELECT id FROM users WHERE lower(handle)')) {
    return Promise.resolve({ rows: [] }) // handle not taken (register path)
  }
  if (t.startsWith('SELECT id, handle, password_hash, password_changed_at')) {
    const h = String(params[0] || '').toLowerCase()
    return Promise.resolve(h === KNOWN_HANDLE
      ? { rows: [{ id: 'user-1', handle: KNOWN_HANDLE, password_hash: KNOWN_HASH, password_changed_at: passwordChangedAt }] }
      : { rows: [] })
  }
  if (t.startsWith('SELECT password_changed_at FROM users WHERE id')) {
    return Promise.resolve({ rows: [{ password_changed_at: passwordChangedAt }] })
  }
  if (t.startsWith('SELECT password_hash FROM users WHERE id')) {
    return Promise.resolve({ rows: [{ password_hash: KNOWN_HASH }] })
  }
  if (t.startsWith('UPDATE users SET password_hash')) {
    return Promise.resolve({ rows: [], rowCount: 1 })
  }
  if (t.includes('posts_count')) { // full profile hydrate (findById / login success)
    return Promise.resolve({ rows: [{
      id: 'user-1', name: 'Alex', handle: KNOWN_HANDLE, avatar_url: null, cover_color: null,
      is_online: false, created_at: new Date(), posts_count: 0, followers_count: 0, following_count: 0,
    }] })
  }
  if (t.startsWith('INSERT INTO users')) {
    return Promise.resolve({ rows: [{
      id: 'user-1', name: 'New', handle: params[1], avatar_url: null, cover_color: null,
      is_online: false, created_at: new Date(),
    }] })
  }
  return Promise.resolve({ rows: [] })
}

let db
let app

beforeAll(async () => { KNOWN_HASH = await bcrypt.hash(KNOWN_PASSWORD, 4) })

beforeEach(() => {
  passwordChangedAt = null
  jest.resetModules()                 // fresh rate-limiter store per test
  jest.mock('../src/db', () => ({ query: jest.fn() }))
  db = require('../src/db')
  db.query.mockImplementation(routeMockImpl)
  app = require('./helpers/testApp')()
})

// ── #1 rate limiting ─────────────────────────────────────────────────────────
test('#1 login is rate-limited to 10 attempts per window, then 429', async () => {
  for (let i = 0; i < 10; i++) {
    const r = await request(app).post('/api/auth/login').send({ handle: 'nobody', password: 'x' })
    expect(r.status).toBe(401)
  }
  const blocked = await request(app).post('/api/auth/login').send({ handle: 'nobody', password: 'x' })
  expect(blocked.status).toBe(429)
})

// ── #2 user enumeration ──────────────────────────────────────────────────────
test('#2 unknown handle and wrong password are indistinguishable', async () => {
  const unknown = await request(app).post('/api/auth/login').send({ handle: 'ghost', password: 'whatever' })
  const wrongPw = await request(app).post('/api/auth/login').send({ handle: KNOWN_HANDLE, password: 'nope' })
  expect(unknown.status).toBe(401)
  expect(wrongPw.status).toBe(401)
  expect(unknown.body).toEqual(wrongPw.body)
  expect(unknown.body.error).toBe('Invalid credentials')
})

test('#2 DUMMY_HASH cost matches configured BCRYPT_ROUNDS', () => {
  jest.isolateModules(() => {
    const rounds = bcrypt.getRounds(bcrypt.hashSync('unused', parseInt(process.env.BCRYPT_ROUNDS, 10)))
    expect(rounds).toBe(4)
  })
})

// ── #3 token revocation on password change ───────────────────────────────────
test('#3 a token issued before password change is rejected', async () => {
  const token = jwt.sign({ sub: 'user-1', handle: `@${KNOWN_HANDLE}` }, process.env.JWT_SECRET)
  const cookie = `token=${token}`

  const before = await request(app).put('/api/auth/password')
    .set('Cookie', cookie).send({ currentPassword: KNOWN_PASSWORD, newPassword: 'brand-new-pw' })
  expect(before.status).toBe(200)

  passwordChangedAt = new Date(Date.now() + 5000) // later than token iat
  const after = await request(app).put('/api/auth/password')
    .set('Cookie', cookie).send({ currentPassword: KNOWN_PASSWORD, newPassword: 'another-pw' })
  expect(after.status).toBe(401)
})

// ── #4 password policy ──────────────────────────────────────────────────────
test('#4 register rejects a password shorter than 8 characters', async () => {
  const r = await request(app).post('/api/auth/register').send({ name: 'A', handle: 'newbie', password: 'short' })
  expect(r.status).toBe(400)
  expect(r.body.error).toMatch(/8 characters/)
})

test('#4 register accepts an 8+ character password', async () => {
  const r = await request(app).post('/api/auth/register').send({ name: 'A', handle: 'newbie', password: 'longenough' })
  expect(r.status).toBe(201)
})

// ── #5 cookie hardening ─────────────────────────────────────────────────────
test('#5 successful login sets HttpOnly, SameSite=Strict, Secure cookie', async () => {
  const r = await request(app).post('/api/auth/login').send({ handle: KNOWN_HANDLE, password: KNOWN_PASSWORD })
  expect(r.status).toBe(200)
  const cookie = r.headers['set-cookie'][0]
  expect(cookie).toMatch(/HttpOnly/i)
  expect(cookie).toMatch(/SameSite=Strict/i)
  expect(cookie).toMatch(/Secure/i)
})

// ── #6 security headers ─────────────────────────────────────────────────────
test('#6 helmet headers are present on responses', async () => {
  const r = await request(app).post('/api/auth/login').send({ handle: 'nobody', password: 'x' })
  expect(r.headers['x-content-type-options']).toBe('nosniff')
  expect(r.headers['x-frame-options']).toBeDefined()
})

// ── #7 startup secret validation ────────────────────────────────────────────
test('#7 server refuses to boot without a >=32 char JWT_SECRET', () => {
  const { spawnSync } = require('child_process')
  const env = { ...process.env, JWT_SECRET: 'tooshort' }
  const r = spawnSync(process.execPath, ['src/index.js'], {
    cwd: path.join(__dirname, '..'), env, encoding: 'utf8', timeout: 10000,
  })
  expect(r.status).toBe(1)
  expect(r.stderr).toMatch(/JWT_SECRET/)
})

// ── #8 no count-subquery amplification on failed logins ─────────────────────
test('#8 failed login never runs the posts_count aggregate query', async () => {
  await request(app).post('/api/auth/login').send({ handle: 'ghost', password: 'x' })
  await request(app).post('/api/auth/login').send({ handle: KNOWN_HANDLE, password: 'wrong' })
  const ranAggregate = db.query.mock.calls.some(([sql]) => sql.includes('posts_count'))
  expect(ranAggregate).toBe(false)
})

test('#8 successful login does hydrate the full profile', async () => {
  await request(app).post('/api/auth/login').send({ handle: KNOWN_HANDLE, password: KNOWN_PASSWORD })
  const ranAggregate = db.query.mock.calls.some(([sql]) => sql.includes('posts_count'))
  expect(ranAggregate).toBe(true)
})

// ── #9 error handler does not leak pg detail ────────────────────────────────
test('#9 errorHandler strips pg err.detail from the response', () => {
  const errorHandler = require('../src/middleware/errorHandler')
  const captured = {}
  const res = { status(c) { captured.code = c; return this }, json(o) { captured.body = o } }
  errorHandler(
    { code: '23505', detail: 'Key (handle)=(alexrivera) already exists.' },
    { method: 'POST', path: '/api/auth/register' }, res, () => {},
  )
  expect(captured.code).toBe(409)
  expect(captured.body).not.toHaveProperty('detail')
  expect(JSON.stringify(captured.body)).not.toContain('alexrivera')
})
