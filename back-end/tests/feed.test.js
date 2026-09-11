'use strict'
const request = require('supertest')
const { makeHarness } = require('./helpers/harness')

let h
beforeEach(() => { h = makeHarness() })

describe('GET /api/feed', () => {
  test('returns posts with pagination metadata and @-prefixed handles', async () => {
    h.when('FROM posts p JOIN users u ON u.id = p.author_id', { rows: [
      { id: 'p1', content: 'hello', author_handle: 'alex', created_at: new Date() },
    ] })
    const res = await request(h.app).get('/api/feed/').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.posts[0].author_handle).toBe('@alex')
    expect(res.body.pagination).toMatchObject({ limit: 20, offset: 0, count: 1 })
  })

  test('clamps the limit query param to 100', async () => {
    let seenLimit
    h.when('FROM posts p JOIN users u ON u.id = p.author_id', (params) => { seenLimit = params[1]; return { rows: [] } })
    await request(h.app).get('/api/feed/?limit=9999').set('Cookie', h.cookie())
    expect(seenLimit).toBe(100)
  })

  test('GET /api/feed/components returns the component posts', async () => {
    h.when("WHERE p.content LIKE 'Component:%'", { rows: [{ id: 'p2', content: 'Component: Btn' }] })
    const res = await request(h.app).get('/api/feed/components').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id: 'p2', content: 'Component: Btn' }])
  })

  test('GET /api/feed/users/:userId returns that user\'s posts', async () => {
    h.when('FROM posts p JOIN users u ON u.id = p.author_id', { rows: [
      { id: 'p3', content: 'mine', author_handle: 'me', created_at: new Date() },
    ] })
    const res = await request(h.app).get('/api/feed/users/u2').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.posts[0].content).toBe('mine')
  })
})
