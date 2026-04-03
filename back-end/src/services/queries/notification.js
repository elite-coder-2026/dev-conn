'use strict'

const notification_queries = {
  list: /*sql*/ `
    SELECT
      n.id,
      n.type,
      n.message,
      n.read,
      n.created_at,
      u.name       AS actor_name,
      u.avatar_url AS actor_avatar_url
    FROM notifications n
    LEFT JOIN users u ON u.id = n.actor_id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50
  `,

  mark_all_read: /*sql*/ `
    UPDATE notifications
    SET read = TRUE
    WHERE user_id = $1 AND read = FALSE
  `,
}

module.exports = notification_queries
