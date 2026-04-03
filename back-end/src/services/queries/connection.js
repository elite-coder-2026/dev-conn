'use strict'

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

module.exports = connection_queries
