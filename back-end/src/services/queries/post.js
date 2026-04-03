'use strict'

const post_queries = {
  exists: /*sql*/ `
    SELECT author_id FROM posts WHERE id = $1 FOR UPDATE
  `,

  get_post: /*sql*/ `
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
      EXISTS(SELECT 1 FROM likes  WHERE post_id = p.id AND user_id = $2) AS liked_by_me,
      EXISTS(SELECT 1 FROM shares WHERE post_id = p.id AND user_id = $2) AS shared_by_me
    FROM posts p
    JOIN users u ON u.id = p.author_id
    WHERE p.id = $1
  `,

  create_post: /*sql*/ `
    INSERT INTO posts (author_id, content, image_url)
    VALUES ($1, $2, $3)
    RETURNING id, author_id, content, image_url, created_at
  `,

  update_post: /*sql*/ `
    UPDATE posts
    SET
      content   = COALESCE($1, content),
      image_url = COALESCE($2, image_url)
    WHERE id = $3
    RETURNING id, author_id, content, image_url, created_at
  `,

  delete_post: /*sql*/ `
    DELETE FROM posts WHERE id = $1
  `,

  add_like: /*sql*/ `
    INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
  `,

  remove_like: /*sql*/ `
    DELETE FROM likes WHERE user_id = $1 AND post_id = $2
  `,

  likes_count: /*sql*/ `
    SELECT COUNT(*)::int AS likes_count FROM likes WHERE post_id = $1
  `,

  add_share: /*sql*/ `
    INSERT INTO shares (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
  `,

  remove_share: /*sql*/ `
    DELETE FROM shares WHERE user_id = $1 AND post_id = $2
  `,

  shares_count: /*sql*/ `
    SELECT COUNT(*)::int AS shares_count FROM shares WHERE post_id = $1
  `,

  get_comments: /*sql*/ `
    SELECT
      c.id, c.content, c.created_at,
      u.id         AS author_id,
      u.name       AS author_name,
      u.handle     AS author_handle,
      u.avatar_url AS author_avatar_url
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `,

  create_comment: /*sql*/ `
    INSERT INTO comments (post_id, author_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, post_id, author_id, content, created_at
  `,

  comment_exists: /*sql*/ `
    SELECT author_id FROM comments WHERE id = $1 FOR UPDATE
  `,

  update_comment: /*sql*/ `
    UPDATE comments SET content = $1 WHERE id = $2
    RETURNING id, post_id, author_id, content, created_at
  `,

  delete_comment: /*sql*/ `
    DELETE FROM comments WHERE id = $1
  `,

  get_comment_author: /*sql*/ `
    SELECT name, handle, avatar_url FROM users WHERE id = $1
  `,
}

module.exports = post_queries
