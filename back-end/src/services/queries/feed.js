'use strict'

const feed_queries = {
  get_components: /*sql*/ `
    SELECT
      p.id,
      p.content,
      p.created_at,
      u.name        AS author_name,
      u.handle      AS author_handle,
      u.avatar_url  AS author_avatar_url
    FROM posts p
    JOIN users u ON u.id = p.author_id
    WHERE p.content LIKE 'Component:%'
    ORDER BY p.created_at DESC
  `,

  get_user_posts_sql: /*sql*/ `
    SELECT
      p.id,
      p.content,
      p.image_url,
      p.created_at,
      u.id          AS author_id,
      u.name        AS author_name,
      u.handle      AS author_handle,
      u.avatar_url  AS author_avatar_url,
      (SELECT COUNT(*) FROM likes    WHERE post_id = p.id)::int AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comments_count,
      (SELECT COUNT(*) FROM shares   WHERE post_id = p.id)::int AS shares_count,
      EXISTS(SELECT 1 FROM likes  WHERE post_id = p.id AND user_id = $1) AS liked_by_me,
      EXISTS(SELECT 1 FROM shares WHERE post_id = p.id AND user_id = $1) AS shared_by_me
    FROM posts p
    JOIN users u ON u.id = p.author_id
  `,
}

module.exports = feed_queries
