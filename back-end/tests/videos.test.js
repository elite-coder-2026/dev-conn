'use strict'
const request = require('supertest')
const { makeHarness, SELF } = require('./helpers/harness')

let h
beforeEach(() => { h = makeHarness() })

describe('GET /api/videos', () => {
  test('returns { videos: [...] }', async () => {
    h.when('FROM videos v JOIN users u ON u.id = v.uploader_id ORDER BY v.created_at DESC', { rows: [{ id: 'v1', title: 'Intro' }] })
    const res = await request(h.app).get('/api/videos/').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ videos: [{ id: 'v1', title: 'Intro' }] })
  })

  test('GET /api/videos/:id -> 404 when missing', async () => {
    h.when('FROM videos v JOIN users u ON u.id = v.uploader_id WHERE v.id', { rows: [] })
    const res = await request(h.app).get('/api/videos/nope').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })

  test('GET /api/videos/:id -> 200 with the row', async () => {
    h.when('FROM videos v JOIN users u ON u.id = v.uploader_id WHERE v.id', { rows: [{ id: 'v1', title: 'Intro' }] })
    const res = await request(h.app).get('/api/videos/v1').set('Cookie', h.cookie())
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 'v1' })
  })
})

describe('POST /api/videos', () => {
  test('400 when required fields are missing', async () => {
    const res = await request(h.app).post('/api/videos/').set('Cookie', h.cookie()).send({ title: 'x' })
    expect(res.status).toBe(400)
  })

  test('201 and stamps the uploader as the current user', async () => {
    h.when('INSERT INTO videos (title, description, src, duration, thumb_color, uploader_id)', (params) => {
      expect(params[5]).toBe(SELF) // uploader_id
      return { rows: [{ id: 'v9', title: 'New', uploader_id: SELF }] }
    })
    const res = await request(h.app).post('/api/videos/').set('Cookie', h.cookie())
      .send({ title: 'New', src: 'http://x/v.mp4', duration: 120 })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 'v9' })
  })
})

describe('PUT / DELETE ownership', () => {
  test('PUT -> 404 when the video is not yours (or missing)', async () => {
    h.when('UPDATE videos SET', { rows: [] })
    const res = await request(h.app).put('/api/videos/v1').set('Cookie', h.cookie()).send({ title: 'edit' })
    expect(res.status).toBe(404)
  })

  test('PUT -> 200 when it is yours', async () => {
    h.when('UPDATE videos SET', { rows: [{ id: 'v1', title: 'edit', uploader_id: SELF }] })
    const res = await request(h.app).put('/api/videos/v1').set('Cookie', h.cookie()).send({ title: 'edit' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('edit')
  })

  test('DELETE -> 404 when nothing was removed', async () => {
    h.when('DELETE FROM videos WHERE id = $1 AND uploader_id = $2', { rowCount: 0, rows: [] })
    const res = await request(h.app).delete('/api/videos/v1').set('Cookie', h.cookie())
    expect(res.status).toBe(404)
  })

  test('DELETE -> 204 on success', async () => {
    h.when('DELETE FROM videos WHERE id = $1 AND uploader_id = $2', { rowCount: 1, rows: [] })
    const res = await request(h.app).delete('/api/videos/v1').set('Cookie', h.cookie())
    expect(res.status).toBe(204)
  })
})
