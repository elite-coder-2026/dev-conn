'use strict'
const pool       = require('../db')
const formatUser = require('../utils/formatUser')

const { user_queries } = require('./queries')

async function createUser({ name, handle, avatar_url, cover_color, password_hash }) {
  const { rows } = await pool.query(
    user_queries.create,
    [name, handle, avatar_url ?? null, cover_color ?? null, password_hash]
  )
  return formatUser(rows[0])
}

async function findById(id) {
  const { rows } = await pool.query(user_queries.find_by_id, [id])
  if (!rows.length) { const e = new Error('User not found'); e.status = 404; throw e }
  return formatUser(rows[0])
}

async function searchUsers(query, limit, offset) {
  const pattern = `%${query.replace(/[%_]/g, '\\$&')}%`
  const { rows } = await pool.query(
   user_queries.search_users_sql,
    [pattern, limit, offset]
  )
  return rows.map(formatUser)
}

async function updateMe(id, { name, avatar_url, cover_color }) {
  const { rows } = await pool.query(
    user_queries.update,
    [name ?? null, avatar_url ?? null, cover_color ?? null, id]
  )
  if (!rows.length) { const e = new Error('User not found'); e.status = 404; throw e }
  return formatUser(rows[0])
}

async function deleteUser(id) {
  const { rowCount } = await pool.query(user_queries.delete, [id])
  if (!rowCount) { const e = new Error('User not found'); e.status = 404; throw e }
}

module.exports = { createUser, findById, searchUsers, updateMe, deleteUser }
