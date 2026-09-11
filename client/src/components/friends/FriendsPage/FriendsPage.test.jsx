import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FriendsPage from './FriendsPage'

function routed(map) {
  global.fetch.mockImplementation((url, opts) => {
    const key = Object.keys(map).find(k => String(url).includes(k))
    const val = typeof map[key] === 'function' ? map[key](opts) : map[key]
    return Promise.resolve({ ok: true, json: () => Promise.resolve(val ?? {}) })
  })
}

const discover = { users: [{ id: 'u2', name: 'Jordan Blake', handle: '@jordan', avatarUrl: null, isOnline: true, followersCount: 3, connection: {} }] }
const incoming = { requests: [{ id: 'req-1', requester: { id: 'u3', name: 'Casey Kim', handle: '@casey', avatarUrl: null, isOnline: false }, mutualCount: 1, createdAt: new Date().toISOString() }] }

beforeEach(() => { global.fetch.mockReset() })

describe('FriendsPage', () => {
  test('loads discover, requests, suggestions and friends on mount', async () => {
    routed({ '/discover': discover, '/requests/incoming': incoming, '/suggestions': { suggestions: [] }, '/friends': { friends: [] } })
    render(<FriendsPage />)

    await waitFor(() => {
      for (const p of ['/api/connections/discover', '/api/connections/requests/incoming', '/api/connections/suggestions', '/api/connections/friends']) {
        expect(global.fetch).toHaveBeenCalledWith(p, expect.objectContaining({ credentials: 'include' }))
      }
    })
    expect(await screen.findByText('Jordan Blake')).toBeInTheDocument()
  })

  test('switching to the Requests tab shows incoming requests, and Accept posts to the accept endpoint', async () => {
    routed({
      '/discover': discover,
      '/requests/incoming': incoming,
      '/suggestions': { suggestions: [] },
      '/friends': { friends: [] },
      '/accept': {},
    })
    render(<FriendsPage />)

    await userEvent.click(await screen.findByRole('button', { name: /requests/i }))
    expect(await screen.findByText('Casey Kim')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /accept/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/connections/requests/req-1/accept', expect.objectContaining({ method: 'POST' })))
  })

  test('Add Friend in the discover grid posts a friend request', async () => {
    routed({
      '/discover': discover,
      '/requests/incoming': { requests: [] },
      '/suggestions': { suggestions: [] },
      '/friends': { friends: [] },
      '/api/connections/requests': { id: 'req-9' },
    })
    render(<FriendsPage />)

    await userEvent.click(await screen.findByRole('button', { name: /add friend/i }))
    const postCall = global.fetch.mock.calls.find(([u, o]) => u === '/api/connections/requests' && o?.method === 'POST')
    expect(postCall).toBeTruthy()
    expect(JSON.parse(postCall[1].body)).toEqual({ recipient_id: 'u2' })
  })
})
