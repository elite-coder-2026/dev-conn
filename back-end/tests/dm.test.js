'use strict'
const request = require('supertest')
const { makeHarness, SELF } = require('./helpers/harness')

const OTHER = 'user-other'
let h
beforeEach(() => { h = makeHarness() })

describe('POST /api/dm/conversations', () => {
  test('400 without target_user_id', async () => {
    const res = await request(h.app).post('/api/dm/conversations').set('Cookie', h.cookie()).send({})
    expect(res.status).toBe(400)
  })

  test('400 when starting a conversation with yourself', async () => {
    const res = await request(h.app).post('/api/dm/conversations').set('Cookie', h.cookie()).send({ target_user_id: SELF })
    expect(res.status).toBe(400)
  })

  test('201 returning the existing conversation when one already exists', async () => {
    h.when('FROM conversations c JOIN conversation_participants a', { rows: [{ id: 'conv-1' }] })
    const res = await request(h.app).post('/api/dm/conversations').set('Cookie', h.cookie()).send({ target_user_id: OTHER })
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: 'conv-1' })
  })

  test('201 creating a new conversation with both participants', async () => {
    h.when('FROM conversations c JOIN conversation_participants a', { rows: [] })
    h.when('INSERT INTO conversations DEFAULT VALUES', { rows: [{ id: 'conv-new', created_at: new Date(), updated_at: new Date() }] })
    const res = await request(h.app).post('/api/dm/conversations').set('Cookie', h.cookie()).send({ target_user_id: OTHER })
    expect(res.status).toBe(201)
    expect(res.body.id).toBe('conv-new')
    expect(h.db.connect.mock.results.length).toBeGreaterThan(0)
  })
})

describe('GET /api/dm/inbox', () => {
  test('returns the inbox rows', async () => {
    h.when('FROM conversations c JOIN conversation_participants me', { rows: [{ conversation_id: 'conv-1', other_user_name: 'Jordan' }] })
    const res = await request(h.app).get('/api/dm/inbox').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ conversation_id: 'conv-1', other_user_name: 'Jordan' }])
  })
})

describe('conversation messages require participation', () => {
  test('GET messages -> 403 for a non-participant', async () => {
    h.when('SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2', { rows: [] })
    const res = await request(h.app).get('/api/dm/conversations/conv-1/messages').set('Cookie', h.cookie())
    expect(res.status).toBe(403)
  })

  test('GET messages -> 200 with { messages, nextCursor } for a participant', async () => {
    h.when('SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2', { rows: [{ '?column?': 1 }] })
    h.when('FROM messages WHERE conversation_id = $1 AND deleted_at IS NULL', { rows: [{ id: 'm1', body: 'hi', created_at: new Date() }] })
    h.when('UPDATE conversation_participants SET last_read_at = NOW()', { rows: [{ last_read_at: new Date().toISOString() }] })
    const res = await request(h.app).get('/api/dm/conversations/conv-1/messages').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.messages).toHaveLength(1)
    expect(res.body).toHaveProperty('nextCursor')
  })

  test('POST message -> 403 for a non-participant', async () => {
    h.when('SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2', { rows: [] })
    const res = await request(h.app).post('/api/dm/conversations/conv-1/messages').set('Cookie', h.cookie()).send({ body: 'hello' })
    expect(res.status).toBe(403)
  })

  test('POST message -> 400 for an empty body (before any participant check)', async () => {
    const res = await request(h.app).post('/api/dm/conversations/conv-1/messages').set('Cookie', h.cookie()).send({ body: '   ' })
    expect(res.status).toBe(400)
  })

  test('POST message -> 400 when body exceeds 5000 chars', async () => {
    const res = await request(h.app).post('/api/dm/conversations/conv-1/messages').set('Cookie', h.cookie()).send({ body: 'x'.repeat(5001) })
    expect(res.status).toBe(400)
  })

  test('POST message -> 201 for a participant', async () => {
    h.when('SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2', { rows: [{ '?column?': 1 }] })
    h.when('INSERT INTO messages (conversation_id, sender_id, body)', { rows: [{ id: 'm9', conversation_id: 'conv-1', sender_id: SELF, body: 'hello', created_at: new Date() }] })
    const res = await request(h.app).post('/api/dm/conversations/conv-1/messages').set('Cookie', h.cookie()).send({ body: 'hello' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 'm9', body: 'hello' })
  })
})

describe('DELETE /api/dm/messages/:id', () => {
  test('404 when the message is not yours', async () => {
    h.when('UPDATE messages SET deleted_at = NOW() WHERE id = $1 AND sender_id = $2', { rows: [] })
    const res = await request(h.app).delete('/api/dm/messages/m1').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })

  test('200 { deleted: true } when it is yours', async () => {
    h.when('UPDATE messages SET deleted_at = NOW() WHERE id = $1 AND sender_id = $2', { rows: [{ id: 'm1' }] })
    const res = await request(h.app).delete('/api/dm/messages/m1').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ deleted: true })
  })
})
