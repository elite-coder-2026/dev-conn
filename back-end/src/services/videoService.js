'use strict'
const pool = require('../db')
const { video_queries } = require('./queries')

async function getVideos() {
  const { rows } = await pool.query(video_queries.get_all)
  return rows
}

async function getVideoById(id) {
  const { rows } = await pool.query(video_queries.get_by_id, [id])
  return rows[0] || null
}

async function createVideo({ title, description, src, duration, thumb_color, uploader_id }) {
  const { rows } = await pool.query(video_queries.create, [
    title, description, src, duration, thumb_color || '#1a1a2e', uploader_id,
  ])
  return rows[0]
}

async function updateVideo(id, { title, description, thumb_color }, uploader_id) {
  const { rows } = await pool.query(video_queries.update, [
    id, title, description, thumb_color, uploader_id,
  ])
  return rows[0] || null
}

async function deleteVideo(id, uploader_id) {
  const { rowCount } = await pool.query(video_queries.delete, [id, uploader_id])
  return rowCount > 0
}

module.exports = { getVideos, getVideoById, createVideo, updateVideo, deleteVideo }
