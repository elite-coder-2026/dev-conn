'use strict'

function formatUser(row) {
  if (!row) return null
  return {
    ...row,
    handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
  }
}

module.exports = formatUser
