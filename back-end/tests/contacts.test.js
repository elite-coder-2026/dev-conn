'use strict'
const request = require('supertest')
const { makeHarness, SELF } = require('./helpers/harness')

const OTHER = 'user-other'
let h
beforeEach(() => { h = makeHarness() })

describe('GET follow lists', () => {
  test('GET /api/contacts/following formats handles with @', async () => {
    h.when('FROM follows f JOIN users u ON u.id = f.following_id', { rows: [{ id: 'u2', name: 'Jordan', handle: 'jordan', avatar_url: null, is_online: true }] })
    const res = await request(h.app).get('/api/contacts/following').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body[0].handle).toBe('@jordan')
  })

  test('GET /api/contacts/followers returns the follower rows', async () => {
    h.when('FROM follows f JOIN users u ON u.id = f.follower_id', { rows: [{ id: 'u3', name: 'Casey', handle: 'casey', avatar_url: null, is_online: false }] })
    const res = await request(h.app).get('/api/contacts/followers').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body[0].handle).toBe('@casey')
  })
})

describe('POST /api/contacts/:userId/follow', () => {
  test('400 when trying to follow yourself', async () => {
    const res = await request(h.app).post(`/api/contacts/${SELF}/follow`).set('Cookie', h.cookie())
    expect(res.status).toBe(400)
  })

  test('404 when the target user does not exist', async () => {
    h.when('SELECT id FROM users WHERE id = $1', { rows: [] })
    const res = await request(h.app).post(`/api/contacts/${OTHER}/follow`).set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })

  test('201 and returns the follower count', async () => {
    h.when('SELECT id FROM users WHERE id = $1', { rows: [{ id: OTHER }] })
    h.when('SELECT COUNT(*)::int AS followers_count FROM follows WHERE following_id', { rows: [{ followers_count: 42 }] })
    const res = await request(h.app).post(`/api/contacts/${OTHER}/follow`).set('Cookie', h.cookie())
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ followers_count: 42 })
  })
})

describe('unfollow & check', () => {
  test('DELETE /api/contacts/:userId/follow returns the fresh count', async () => {
    h.when('SELECT COUNT(*)::int AS followers_count FROM follows WHERE following_id', { rows: [{ followers_count: 41 }] })
    const res = await request(h.app).delete(`/api/contacts/${OTHER}/follow`).set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ followers_count: 41 })
  })

  test('GET /api/contacts/:userId/following reports the follow relationship', async () => {
    h.when('SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2', { rows: [{ '?column?': 1 }] })
    const res = await request(h.app).get(`/api/contacts/${OTHER}/following`).set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ following: true })
  })

  test('GET /api/contacts/:userId/following is false when there is no row', async () => {
    h.when('SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2', { rows: [] })
    const res = await request(h.app).get(`/api/contacts/${OTHER}/following`).set('Cookie', h.cookie())
    expect(res.body).toEqual({ following: false })
  })
})
