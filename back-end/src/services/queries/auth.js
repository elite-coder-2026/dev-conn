'use strict'

const auth_queries = {
  exists: /*sql*/ `
    SELECT id FROM users WHERE lower(handle) = lower($1)
  `,
  register: /*sql*/ `
    INSERT INTO users (name, handle, avatar_url, cover_color, password_hash)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, handle, avatar_url, cover_color, is_online, created_at
  `,
  login: /*sql*/ `
    SELECT
      u.id, u.name, u.handle, u.avatar_url, u.cover_color, u.is_online, u.created_at, u.password_hash,
      (SELECT COUNT(*) FROM posts   WHERE author_id   = u.id)::int AS posts_count,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id)::int AS followers_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id  = u.id)::int AS following_count
    FROM users u
    WHERE lower(u.handle) = lower($1)
  `,
  update: /*sql*/ `
    UPDATE users SET password_hash = $1 WHERE id = $2
  `,
  delete_account_sql: /*sql*/ `
    DELETE FROM users WHERE id = $1
  `,
}

module.exports = auth_queries
