'use strict'

const dm_queries = {
  findExistingConversation: /*sql*/ `
    SELECT c.id
    FROM conversations c
    JOIN conversation_participants a ON a.conversation_id = c.id AND a.user_id = $1
    JOIN conversation_participants b ON b.conversation_id = c.id AND b.user_id = $2
    WHERE (
      SELECT COUNT(*) FROM conversation_participants p WHERE p.conversation_id = c.id
    ) = 2
    LIMIT 1
  `,

  createConversation: /*sql*/ `
    INSERT INTO conversations DEFAULT VALUES RETURNING id, created_at, updated_at
  `,

  addParticipant: /*sql*/ `
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `,

  isParticipant: /*sql*/ `
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = $1 AND user_id = $2
  `,

  insertMessage: /*sql*/ `
    INSERT INTO messages (conversation_id, sender_id, body)
    VALUES ($1, $2, $3)
    RETURNING id, conversation_id, sender_id, body, created_at
  `,

  getMessages: /*sql*/ `
    SELECT id, conversation_id, sender_id, body, created_at
    FROM messages
    WHERE conversation_id = $1
      AND deleted_at IS NULL
      AND (
        $3::uuid IS NULL
        OR created_at < (SELECT created_at FROM messages WHERE id = $3::uuid)
      )
    ORDER BY created_at DESC
    LIMIT $2
  `,

  markReadReceipts: /*sql*/ `
    INSERT INTO message_receipts (message_id, user_id)
    SELECT m.id, $2
    FROM messages m
    WHERE m.conversation_id = $1
      AND m.sender_id <> $2
      AND m.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM message_receipts r WHERE r.message_id = m.id AND r.user_id = $2
      )
    ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = NOW()
  `,

  updateLastReadAt: /*sql*/ `
    UPDATE conversation_participants
    SET last_read_at = NOW()
    WHERE conversation_id = $1 AND user_id = $2
    RETURNING last_read_at
  `,

  getInbox: /*sql*/ `
    SELECT
      c.id              AS conversation_id,
      c.updated_at,
      other_u.id        AS other_user_id,
      other_u.name      AS other_user_name,
      other_u.handle    AS other_user_handle,
      other_u.avatar_url AS other_user_avatar_url,
      other_u.is_online AS other_user_is_online,
      last_msg.body     AS last_message_body,
      last_msg.created_at AS last_message_at,
      last_msg.sender_id  AS last_message_sender_id,
      (
        SELECT COUNT(*)::int
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender_id <> $1
          AND m.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM message_receipts r WHERE r.message_id = m.id AND r.user_id = $1
          )
      ) AS unread_count
    FROM conversations c
    JOIN conversation_participants me  ON me.conversation_id  = c.id AND me.user_id  = $1
    JOIN conversation_participants opp ON opp.conversation_id = c.id AND opp.user_id <> $1
    JOIN users other_u ON other_u.id = opp.user_id
    LEFT JOIN LATERAL (
      SELECT body, created_at, sender_id
      FROM messages
      WHERE conversation_id = c.id AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    ) last_msg ON true
    ORDER BY c.updated_at DESC
  `,

  getUnreadCount: /*sql*/ `
    SELECT COUNT(*)::int AS unread_count
    FROM messages m
    JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = $1
    WHERE m.sender_id <> $1
      AND m.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM message_receipts r WHERE r.message_id = m.id AND r.user_id = $1
      )
  `,

  softDeleteMessage: /*sql*/ `
    UPDATE messages
    SET deleted_at = NOW()
    WHERE id = $1 AND sender_id = $2 AND deleted_at IS NULL
    RETURNING id
  `,
}

module.exports = dm_queries
