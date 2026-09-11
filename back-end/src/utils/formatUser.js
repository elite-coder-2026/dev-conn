'use strict'

function formatUser(row) {
  if (!row) return null
  const { password_hash, password_changed_at, ...safe } = row
  return {
    ...safe,
    handle: safe.handle.startsWith('@') ? safe.handle : `@${safe.handle}`,
  }
}

module.exports = formatUser
