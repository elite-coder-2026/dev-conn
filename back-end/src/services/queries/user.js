'use strict'

const user_queries = {
  create: /*sql*/ `
    INSERT INTO users (name, handle, avatar_url, cover_color, password_hash)
    VALUES ($1, $2, $3, COALESCE($4, 'linear-gradient(135deg, #5B4FE9 0%, #7B72ED 100%)'), $5)
    RETURNING id, name, handle, avatar_url, cover_color, is_online, created_at
  `,

  find_by_id: /*sql*/ `
    SELECT
      u.*,
      (SELECT COUNT(*) FROM posts   WHERE author_id   = u.id)::int AS posts_count,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id)::int AS followers_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id  = u.id)::int AS following_count
    FROM users u
    WHERE u.id = $1
  `,

  search_users_sql: /*sql*/ `
    SELECT
      u.id,
      u.name,
      u.handle,
      u.avatar_url,
      u.is_online,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id)::int AS followers_count
    FROM users u
    WHERE u.name ILIKE $1 OR u.handle ILIKE $1
    ORDER BY followers_count DESC, u.name ASC
    LIMIT $2 OFFSET $3
  `,

  update: /*sql*/ `
    UPDATE users
    SET
      name        = COALESCE($1, name),
      avatar_url  = COALESCE($2, avatar_url),
      cover_color = COALESCE($3, cover_color)
    WHERE id = $4
    RETURNING id, name, handle, avatar_url, cover_color, is_online, created_at
  `,

  delete: /*sql*/ `
    DELETE FROM users WHERE id = $1
  `,
}

module.exports = user_queries
