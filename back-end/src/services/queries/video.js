'use strict'

const video_queries = {
  get_all: /*sql*/ `
    SELECT
      v.id,
      v.title,
      v.description,
      v.src,
      v.duration,
      v.thumb_color,
      v.views_count,
      v.created_at,
      u.id         AS uploader_id,
      u.name       AS uploader_name,
      u.handle     AS uploader_handle,
      u.avatar_url AS uploader_avatar_url
    FROM videos v
    JOIN users u ON u.id = v.uploader_id
    ORDER BY v.created_at DESC
  `,

  get_by_id: /*sql*/ `
    SELECT
      v.id,
      v.title,
      v.description,
      v.src,
      v.duration,
      v.thumb_color,
      v.views_count,
      v.created_at,
      u.id         AS uploader_id,
      u.name       AS uploader_name,
      u.handle     AS uploader_handle,
      u.avatar_url AS uploader_avatar_url
    FROM videos v
    JOIN users u ON u.id = v.uploader_id
    WHERE v.id = $1
  `,

  create: /*sql*/ `
    INSERT INTO videos (title, description, src, duration, thumb_color, uploader_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,

  update: /*sql*/ `
    UPDATE videos
    SET title       = COALESCE($2, title),
        description = COALESCE($3, description),
        thumb_color = COALESCE($4, thumb_color)
    WHERE id = $1 AND uploader_id = $5
    RETURNING *
  `,

  delete: /*sql*/ `
    DELETE FROM videos
    WHERE id = $1 AND uploader_id = $2
  `,
}

module.exports = video_queries
