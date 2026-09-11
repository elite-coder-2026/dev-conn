'use strict'
const request = require('supertest')
const { makeHarness, SELF } = require('./helpers/harness')

const OTHER = 'user-other'
let h
beforeEach(() => { h = makeHarness() })

describe('POST /api/connections/requests', () => {
  test('400 without a recipient_id', async () => {
    const res = await request(h.app).post('/api/connections/requests').set('Cookie', h.cookie()).send({})
    expect(res.status).toBe(400)
  })

  test('400 when the recipient is yourself', async () => {
    const res = await request(h.app).post('/api/connections/requests').set('Cookie', h.cookie()).send({ recipient_id: SELF })
    expect(res.status).toBe(400)
  })

  test('201 when there is no existing connection', async () => {
    h.when('FROM friend_requests WHERE (requester_id = $1 AND recipient_id = $2)', { rows: [] })
    h.when('INSERT INTO friend_requests (requester_id, recipient_id)', { rows: [{ id: 'fr1', requester_id: SELF, recipient_id: OTHER, status: 'pending', created_at: new Date() }] })
    const res = await request(h.app).post('/api/connections/requests').set('Cookie', h.cookie()).send({ recipient_id: OTHER })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 'fr1', status: 'pending' })
  })

  test('409 when the two users are already friends', async () => {
    h.when('FROM friend_requests WHERE (requester_id = $1 AND recipient_id = $2)', { rows: [{ id: 'fr1', requester_id: OTHER, recipient_id: SELF, status: 'accepted' }] })
    const res = await request(h.app).post('/api/connections/requests').set('Cookie', h.cookie()).send({ recipient_id: OTHER })
    expect(res.status).toBe(409)
  })
})

describe('request lifecycle', () => {
  test('accept: 404 when the request is not pending / not addressed to you', async () => {
    h.when('UPDATE friend_requests SET status = \'accepted\'', { rows: [] })
    const res = await request(h.app).post('/api/connections/requests/fr1/accept').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })

  test('accept: 200 and creates the mutual follow rows', async () => {
    h.when('UPDATE friend_requests SET status = \'accepted\'', { rows: [{ id: 'fr1', requester_id: OTHER, recipient_id: SELF, status: 'accepted' }] })
    const res = await request(h.app).post('/api/connections/requests/fr1/accept').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    const insertedFollows = h.db.query.mock.calls.some(([sql]) => /INSERT INTO follows/.test(sql))
    expect(insertedFollows).toBe(true)
  })

  test('decline: 404 when not pending', async () => {
    h.when('UPDATE friend_requests SET status = \'declined\'', { rows: [] })
    const res = await request(h.app).post('/api/connections/requests/fr1/decline').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })

  test('cancel: 404 when nothing was deleted', async () => {
    h.when('DELETE FROM friend_requests WHERE id = $1 AND requester_id = $2', { rows: [] })
    const res = await request(h.app).delete('/api/connections/requests/fr1').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })
})

describe('friends & status', () => {
  test('GET /friends returns the list with a count', async () => {
    h.when('FROM friend_requests fr JOIN users u ON u.id = CASE', { rows: [
      { id: 'u2', name: 'Jordan', handle: 'jordan', avatar_url: null, is_online: true, connection_id: 'fr1', friends_since: new Date() },
    ] })
    const res = await request(h.app).get('/api/connections/friends').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.count).toBe(1)
    expect(res.body.friends[0].handle).toBe('@jordan')
  })

  test('DELETE /friends/:userId -> 404 when they are not friends', async () => {
    h.when('DELETE FROM friend_requests WHERE status = \'accepted\'', { rows: [] })
    const res = await request(h.app).delete(`/api/connections/friends/${OTHER}`).set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })

  test('GET /status/:userId -> { status: "none" } when unconnected', async () => {
    h.when('FROM friend_requests WHERE (requester_id = $1 AND recipient_id = $2)', { rows: [] })
    const res = await request(h.app).get(`/api/connections/status/${OTHER}`).set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'none' })
  })
})

describe('discovery', () => {
  test('GET /discover maps rows into the view model', async () => {
    h.when('FROM users u WHERE u.id <> $1 ORDER BY u.is_online DESC', { rows: [
      { id: 'u2', name: 'Jordan', handle: 'jordan', avatar_url: null, is_online: true, followers_count: 3, friend_status: null, is_following: false },
    ] })
    const res = await request(h.app).get('/api/connections/discover').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.users[0]).toMatchObject({ id: 'u2', handle: '@jordan' })
  })

  test('GET /suggestions returns a paginated list', async () => {
    h.when('AND NOT EXISTS ( SELECT 1 FROM friend_requests fr', { rows: [
      { id: 'u3', name: 'Casey', handle: 'casey', avatar_url: null, is_online: false, mutual_count: 2 },
    ] })
    const res = await request(h.app).get('/api/connections/suggestions').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.suggestions[0]).toMatchObject({ handle: '@casey', mutualCount: 2 })
  })
})
