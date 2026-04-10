'use strict'
const videoService = require('../services/videoService')

async function getVideos(req, res, next) {
  try {
    const videos = await videoService.getVideos()
    res.json({ videos })
  } catch (err) { next(err) }
}

async function getVideo(req, res, next) {
  try {
    const video = await videoService.getVideoById(req.params.id)
    if (!video) return res.status(404).json({ error: 'Video not found' })
    res.json(video)
  } catch (err) { next(err) }
}

async function createVideo(req, res, next) {
  try {
    const { title, description, src, duration, thumb_color } = req.body
    if (!title || !src || !duration) {
      return res.status(400).json({ error: 'title, src, and duration are required' })
    }
    const video = await videoService.createVideo({
      title, description, src, duration, thumb_color,
      uploader_id: req.user.id,
    })
    res.status(201).json(video)
  } catch (err) { next(err) }
}

async function updateVideo(req, res, next) {
  try {
    const { title, description, thumb_color } = req.body
    const video = await videoService.updateVideo(req.params.id, { title, description, thumb_color }, req.user.id)
    if (!video) return res.status(404).json({ error: 'Video not found or not yours' })
    res.json(video)
  } catch (err) { next(err) }
}

async function deleteVideo(req, res, next) {
  try {
    const deleted = await videoService.deleteVideo(req.params.id, req.user.id)
    if (!deleted) return res.status(404).json({ error: 'Video not found or not yours' })
    res.status(204).send()
  } catch (err) { next(err) }
}

module.exports = { getVideos, getVideo, createVideo, updateVideo, deleteVideo }
