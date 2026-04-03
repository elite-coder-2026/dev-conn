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
    SELECT id, name, handle, avatar_url, cover_color, is_online, created_at, password_hash
    FROM users
    WHERE lower(handle) = lower($1)
  `,
  update: /*sql*/ `
    UPDATE users SET password_hash = $1 WHERE id = $2
  `,
  delete_account_sql: /*sql*/ `
    DELETE FROM users WHERE id = $1
  `,
}

module.exports = auth_queries
