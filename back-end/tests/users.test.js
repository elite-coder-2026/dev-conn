'use strict'
const request = require('supertest')
const { makeHarness, SELF } = require('./helpers/harness')

let h
beforeEach(() => { h = makeHarness() })

describe('GET /api/users/me', () => {
  test('200 and never leaks password_hash / password_changed_at', async () => {
    h.when('FROM users u WHERE u.id = $1', { rows: [{
      id: SELF, name: 'Me', handle: 'self', avatar_url: null, cover_color: '#111',
      is_online: true, created_at: new Date(),
      password_hash: '$2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      password_changed_at: new Date(),
      posts_count: 1, followers_count: 2, following_count: 3,
    }] })
    const res = await request(h.app).get('/api/users/me').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).not.toHaveProperty('password_hash')
    expect(res.body).not.toHaveProperty('password_changed_at')
    expect(res.body.handle).toBe('@self')
  })

  test('404 when the profile row is gone', async () => {
    h.when('FROM users u WHERE u.id = $1', { rows: [] })
    const res = await request(h.app).get('/api/users/me').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/users/me', () => {
  test('updates and returns the profile', async () => {
    h.when('UPDATE users SET name = COALESCE($1, name)', { rows: [{
      id: SELF, name: 'New Name', handle: 'self', avatar_url: null, cover_color: '#111', is_online: false, created_at: new Date(),
    }] })
    const res = await request(h.app).put('/api/users/me').set('Cookie', h.cookie()).send({ name: 'New Name' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New Name')
  })
})

describe('DELETE /api/users/me', () => {
  test('204 when a row was deleted', async () => {
    h.when('DELETE FROM users WHERE id = $1', { rowCount: 1, rows: [] })
    const res = await request(h.app).delete('/api/users/me').set('Cookie', h.cookie())
    expect(res.status).toBe(204)
  })

  test('404 when there was nothing to delete', async () => {
    h.when('DELETE FROM users WHERE id = $1', { rowCount: 0, rows: [] })
    const res = await request(h.app).delete('/api/users/me').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })
})

describe('GET /api/users/search', () => {
  test('400 without a q parameter', async () => {
    const res = await request(h.app).get('/api/users/search').set('Cookie', h.cookie())
    expect(res.status).toBe(400)
  })

  test('escapes LIKE wildcards and clamps the limit', async () => {
    let seen
    h.when('WHERE u.name ILIKE $1 OR u.handle ILIKE $1', (params) => { seen = params; return { rows: [] } })
    await request(h.app).get('/api/users/search?q=50%25_off&limit=5000').set('Cookie', h.cookie())
    expect(seen[0]).toBe('%50\\%\\_off%') // % and _ escaped
    expect(seen[1]).toBe(100)            // limit clamped
  })

  test('returns users with pagination metadata', async () => {
    h.when('WHERE u.name ILIKE $1 OR u.handle ILIKE $1', { rows: [{ id: 'u2', name: 'Jordan', handle: 'jordan', avatar_url: null, is_online: true, followers_count: 3 }] })
    const res = await request(h.app).get('/api/users/search?q=jor').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.users[0].handle).toBe('@jordan')
    expect(res.body.pagination).toMatchObject({ limit: 20, offset: 0, count: 1 })
  })
})

describe('POST /api/users', () => {
  test('400 when name / handle / password_hash are missing', async () => {
    const res = await request(h.app).post('/api/users/').set('Cookie', h.cookie()).send({ name: 'x' })
    expect(res.status).toBe(400)
  })
})
