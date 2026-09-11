'use strict'
const request = require('supertest')
const { makeHarness } = require('./helpers/harness')

let h
beforeEach(() => { h = makeHarness() })

describe('GET /api/notifications', () => {
  test('maps rows into the client shape', async () => {
    h.when('FROM notifications n LEFT JOIN users u ON u.id = n.actor_id', { rows: [
      { id: 'n1', type: 'like', message: 'liked your post', read: false, created_at: new Date(), actor_name: 'Alex', actor_avatar_url: null },
    ] })
    const res = await request(h.app).get('/api/notifications/').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body[0]).toMatchObject({ id: 'n1', type: 'like', name: 'Alex', message: 'liked your post', read: false })
    expect(res.body[0]).toHaveProperty('timeAgo')
  })

  test('falls back to "Someone" when the actor is unknown', async () => {
    h.when('FROM notifications n LEFT JOIN users u ON u.id = n.actor_id', { rows: [
      { id: 'n2', type: 'mention', message: 'mentioned you', read: true, created_at: new Date(), actor_name: null, actor_avatar_url: null },
    ] })
    const res = await request(h.app).get('/api/notifications/').set('Cookie', h.cookie())
    expect(res.body[0].name).toBe('Someone')
  })
})

describe('PATCH /api/notifications/read-all', () => {
  test('marks all read and returns 204', async () => {
    const res = await request(h.app).patch('/api/notifications/read-all').set('Cookie', h.cookie())
    expect(res.status).toBe(204)
    const ranUpdate = h.db.query.mock.calls.some(([sql]) => /UPDATE notifications\s+SET read = TRUE/.test(sql))
    expect(ranUpdate).toBe(true)
  })
})
