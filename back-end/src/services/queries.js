'use strict'

const auth_queries = {
    exists: /*sql*/`
        SELECT id FROM users WHERE lower(handle) = lower($1)
    `,
    register: /*sql*/`
        INSERT INTO users (name, handle, avatar_url, cover_color, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, handle, avatar_url, cover_color, is_online, created_at
    `,
    login: /*sql*/`
        SELECT id, name, handle, avatar_url, cover_color, is_online, created_at, password_hash
        FROM users
        WHERE lower(handle) = lower($1)
    `,
    update: /*sql*/`
        UPDATE users SET password_hash = $1 WHERE id = $2
    `,
    delete_account_sql: /*sql*/`
        DELETE FROM users WHERE id = $1
    `,
};

const contact_sql = {
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

const user_queries = {
  create: /*sql*/ `
    INSERT INTO users (name, handle, avatar_url, cover_color, password_hash)
    VALUES ($1, $2, $3, $4, $5)
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

const feed_queries = {
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

const connection_queries = {

  send_request: /*sql*/ `
    INSERT INTO friend_requests (requester_id, recipient_id)
    VALUES ($1, $2)
    ON CONFLICT (requester_id, recipient_id) DO NOTHING
    RETURNING id, requester_id, recipient_id, status, created_at
  `,

  cancel_request: /*sql*/ `
    DELETE FROM friend_requests
    WHERE id = $1 AND requester_id = $2 AND status = 'pending'
    RETURNING id
  `,

  get_request_by_id: /*sql*/ `
    SELECT id, requester_id, recipient_id, status FROM friend_requests WHERE id = $1
  `,

  incoming_requests: /*sql*/ `
    SELECT
      fr.id,
      fr.created_at,
      u.id         AS requester_id,
      u.name,
      u.handle,
      u.avatar_url,
      u.is_online,
      (
        SELECT COUNT(*)::int FROM (
          SELECT CASE WHEN m.requester_id = $1 THEN m.recipient_id ELSE m.requester_id END AS fid
          FROM friend_requests m
          WHERE (m.requester_id = $1 OR m.recipient_id = $1) AND m.status = 'accepted'
        ) mine
        JOIN (
          SELECT CASE WHEN t.requester_id = u.id THEN t.recipient_id ELSE t.requester_id END AS fid
          FROM friend_requests t
          WHERE (t.requester_id = u.id OR t.recipient_id = u.id) AND t.status = 'accepted'
        ) theirs ON mine.fid = theirs.fid
      ) AS mutual_count
    FROM friend_requests fr
    JOIN users u ON u.id = fr.requester_id
    WHERE fr.recipient_id = $1 AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `,

  outgoing_requests: /*sql*/ `
    SELECT
      fr.id,
      fr.created_at,
      u.id         AS recipient_id,
      u.name,
      u.handle,
      u.avatar_url
    FROM friend_requests fr
    JOIN users u ON u.id = fr.recipient_id
    WHERE fr.requester_id = $1 AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `,

  accept_request: /*sql*/ `
    UPDATE friend_requests
    SET status = 'accepted'
    WHERE id = $1 AND recipient_id = $2 AND status = 'pending'
    RETURNING id, requester_id, recipient_id, status
  `,

  decline_request: /*sql*/ `
    UPDATE friend_requests
    SET status = 'declined'
    WHERE id = $1 AND recipient_id = $2 AND status = 'pending'
    RETURNING id, requester_id, recipient_id, status
  `,

  friends: /*sql*/ `
    SELECT
      u.id,
      u.name,
      u.handle,
      u.avatar_url,
      u.is_online,
      fr.id         AS connection_id,
      fr.created_at AS friends_since
    FROM friend_requests fr
    JOIN users u ON u.id = CASE
      WHEN fr.requester_id = $1 THEN fr.recipient_id
      ELSE fr.requester_id
    END
    WHERE (fr.requester_id = $1 OR fr.recipient_id = $1)
      AND fr.status = 'accepted'
    ORDER BY u.is_online DESC, u.name ASC
  `,

  unfriend: /*sql*/ `
    DELETE FROM friend_requests
    WHERE status = 'accepted'
      AND (
        (requester_id = $1 AND recipient_id = $2) OR
        (requester_id = $2 AND recipient_id = $1)
      )
    RETURNING id
  `,

  connection_status: /*sql*/ `
    SELECT id, requester_id, recipient_id, status
    FROM friend_requests
    WHERE (requester_id = $1 AND recipient_id = $2)
       OR (requester_id = $2 AND recipient_id = $1)
    LIMIT 1
  `,

  discover: /*sql*/ `
    SELECT
      u.id,
      u.name,
      u.handle,
      u.avatar_url,
      u.is_online,
      (SELECT COUNT(*)::int FROM follows WHERE following_id = u.id) AS followers_count,
      (
        SELECT fr.status FROM friend_requests fr
        WHERE (fr.requester_id = $1 AND fr.recipient_id = u.id)
           OR (fr.requester_id = u.id AND fr.recipient_id = $1)
        LIMIT 1
      ) AS friend_status,
      (
        SELECT fr.requester_id FROM friend_requests fr
        WHERE (fr.requester_id = $1 AND fr.recipient_id = u.id)
           OR (fr.requester_id = u.id AND fr.recipient_id = $1)
        LIMIT 1
      ) AS friend_requester_id,
      EXISTS(
        SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = u.id
      ) AS is_following
    FROM users u
    WHERE u.id <> $1
    ORDER BY u.is_online DESC, u.name ASC
    LIMIT $2 OFFSET $3
  `,

  suggestions: /*sql*/ `
    SELECT
      u.id,
      u.name,
      u.handle,
      u.avatar_url,
      u.is_online,
      (
        SELECT COUNT(*)::int FROM (
          SELECT CASE WHEN m.requester_id = $1 THEN m.recipient_id ELSE m.requester_id END AS fid
          FROM friend_requests m
          WHERE (m.requester_id = $1 OR m.recipient_id = $1) AND m.status = 'accepted'
        ) mine
        JOIN (
          SELECT CASE WHEN t.requester_id = u.id THEN t.recipient_id ELSE t.requester_id END AS fid
          FROM friend_requests t
          WHERE (t.requester_id = u.id OR t.recipient_id = u.id) AND t.status = 'accepted'
        ) theirs ON mine.fid = theirs.fid
      ) AS mutual_count
    FROM users u
    WHERE u.id <> $1
      AND NOT EXISTS (
        SELECT 1 FROM friend_requests fr
        WHERE (fr.requester_id = $1 AND fr.recipient_id = u.id)
           OR (fr.requester_id = u.id AND fr.recipient_id = $1)
      )
    ORDER BY mutual_count DESC, u.name ASC
    LIMIT $2 OFFSET $3
  `,

}

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

module.exports = { auth_queries, contact_sql, post_queries, user_queries, feed_queries, connection_queries, dm_queries }
