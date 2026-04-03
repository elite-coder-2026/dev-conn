'use strict'

const contact_queries = {
  following: /*sql*/ `
    SELECT u.id, u.name, u.handle, u.avatar_url, u.is_online
    FROM follows f
    JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = $1
    ORDER BY u.is_online DESC, u.name ASC
  `,

  get_followers_sql: /*sql*/ `
    SELECT u.id, u.name, u.handle, u.avatar_url, u.is_online
    FROM follows f
    JOIN users u ON u.id = f.follower_id
    WHERE f.following_id = $1
    ORDER BY u.is_online DESC, u.name ASC
  `,

  follow: /*sql*/ `
    INSERT INTO follows (follower_id, following_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `,

  unfollow: /*sql*/ `
    DELETE FROM follows
    WHERE follower_id = $1 AND following_id = $2
  `,

  followers_count_sql: /*sql*/ `
    SELECT COUNT(*)::int AS followers_count
    FROM follows
    WHERE following_id = $1
  `,

  is_following_sql: /*sql*/ `
    SELECT 1 FROM follows
    WHERE follower_id = $1 AND following_id = $2
  `,
}

module.exports = contact_queries
