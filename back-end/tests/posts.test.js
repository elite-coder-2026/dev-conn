'use strict'
const request = require('supertest')
const { makeHarness, SELF } = require('./helpers/harness')

const OTHER = 'user-other'
let h
beforeEach(() => { h = makeHarness() })

describe('POST /api/posts', () => {
  test('400 when content is missing', async () => {
    const res = await request(h.app).post('/api/posts/').set('Cookie', h.cookie()).send({})
    expect(res.status).toBe(400)
  })

  test('201 and returns the created post with an @-prefixed author handle', async () => {
    h.when('INSERT INTO posts (author_id, content, image_url)', { rows: [{ id: 'p1', author_id: SELF, content: 'hi', image_url: null, created_at: new Date() }] })
    h.when('SELECT name, handle, avatar_url FROM users WHERE id', { rows: [{ name: 'Me', handle: 'self', avatar_url: null }] })

    const res = await request(h.app).post('/api/posts/').set('Cookie', h.cookie()).send({ content: 'hi' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 'p1', author_handle: '@self', likes_count: 0 })
  })
})

describe('GET /api/posts/:id', () => {
  test('200 with the post when it exists', async () => {
    h.when('FROM posts p JOIN users u ON u.id = p.author_id WHERE p.id', { rows: [{ id: 'p1', content: 'x', author_handle: 'alex', created_at: new Date() }] })
    const res = await request(h.app).get('/api/posts/p1').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body.author_handle).toBe('@alex')
  })

  test('404 when the post is missing', async () => {
    const res = await request(h.app).get('/api/posts/nope').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/posts/:id ownership', () => {
  test('403 when the requester is not the author', async () => {
    h.when('SELECT author_id FROM posts WHERE id', { rows: [{ author_id: OTHER }] })
    const res = await request(h.app).put('/api/posts/p1').set('Cookie', h.cookie()).send({ content: 'edit' })
    expect(res.status).toBe(403)
  })

  test('200 when the requester owns the post', async () => {
    h.when('SELECT author_id FROM posts WHERE id', { rows: [{ author_id: SELF }] })
    h.when('UPDATE posts SET', { rows: [{ id: 'p1', author_id: SELF, content: 'edit', image_url: null, created_at: new Date() }] })
    const res = await request(h.app).put('/api/posts/p1').set('Cookie', h.cookie()).send({ content: 'edit' })
    expect(res.status).toBe(200)
    expect(res.body.content).toBe('edit')
  })
})

describe('DELETE /api/posts/:id ownership', () => {
  test('403 for a non-author', async () => {
    h.when('SELECT author_id FROM posts WHERE id', { rows: [{ author_id: OTHER }] })
    const res = await request(h.app).delete('/api/posts/p1').set('Cookie', h.cookie())
    expect(res.status).toBe(403)
  })

  test('204 for the author', async () => {
    h.when('SELECT author_id FROM posts WHERE id', { rows: [{ author_id: SELF }] })
    h.when('DELETE FROM posts WHERE id', { rows: [] })
    const res = await request(h.app).delete('/api/posts/p1').set('Cookie', h.cookie())
    expect(res.status).toBe(204)
  })
})

describe('likes', () => {
  test('POST /api/posts/:id/like returns the fresh like count', async () => {
    h.when('SELECT COUNT(*)::int AS likes_count FROM likes WHERE post_id', { rows: [{ likes_count: 7 }] })
    const res = await request(h.app).post('/api/posts/p1/like').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ likes_count: 7 })
  })
})

describe('comments', () => {
  test('400 when comment content is blank', async () => {
    const res = await request(h.app).post('/api/posts/p1/comments').set('Cookie', h.cookie()).send({ content: '   ' })
    expect(res.status).toBe(400)
  })

  test('201 with the created comment', async () => {
    h.when('INSERT INTO comments (post_id, author_id, content)', { rows: [{ id: 'c1', post_id: 'p1', author_id: SELF, content: 'nice', created_at: new Date() }] })
    h.when('SELECT name, handle, avatar_url FROM users WHERE id', { rows: [{ name: 'Me', handle: 'self', avatar_url: null }] })
    const res = await request(h.app).post('/api/posts/p1/comments').set('Cookie', h.cookie()).send({ content: 'nice' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 'c1', author_handle: '@self' })
  })

  test('DELETE a comment you do not own -> 403', async () => {
    h.when('SELECT author_id FROM comments WHERE id', { rows: [{ author_id: OTHER }] })
    const res = await request(h.app).delete('/api/posts/p1/comments/c1').set('Cookie', h.cookie())
    expect(res.status).toBe(403)
  })

  test('DELETE your own comment -> 204', async () => {
    h.when('SELECT author_id FROM comments WHERE id', { rows: [{ author_id: SELF }] })
    h.when('DELETE FROM comments WHERE id', { rows: [] })
    const res = await request(h.app).delete('/api/posts/p1/comments/c1').set('Cookie', h.cookie())
    expect(res.status).toBe(204)
  })
})
