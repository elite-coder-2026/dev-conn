import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import FeedPage from './FeedPage'

const currentUser = { id: 'me', name: 'Alex Rivera', handle: '@alex', avatarSrc: null, stats: { posts: 0, followers: 0, following: 0 } }

function routed(map) {
  global.fetch.mockImplementation((url) => {
    const key = Object.keys(map).find(k => String(url).includes(k))
    return Promise.resolve({ ok: true, json: () => Promise.resolve(map[key] ?? {}) })
  })
}

beforeEach(() => { global.fetch.mockReset() })

describe('FeedPage', () => {
  test('fetches the friends list and the feed on mount', async () => {
    routed({ '/api/connections/friends': { friends: [] }, '/api/feed/': { posts: [] } })
    render(<FeedPage currentUser={currentUser} />)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/connections/friends', expect.objectContaining({ credentials: 'include' }))
      expect(global.fetch).toHaveBeenCalledWith('/api/feed/', expect.objectContaining({ credentials: 'include' }))
    })
  })

  test('renders posts returned by the feed endpoint', async () => {
    routed({
      '/api/connections/friends': { friends: [] },
      '/api/feed/': { posts: [
        { id: 'p1', content: 'first feed post', image_url: null, created_at: new Date().toISOString(),
          author_name: 'Sam', author_handle: '@sam', author_avatar_url: null,
          likes_count: 0, comments_count: 0, shares_count: 0, liked_by_me: false, shared_by_me: false },
      ] },
    })
    render(<FeedPage currentUser={currentUser} />)
    expect(await screen.findByText('first feed post')).toBeInTheDocument()
  })

  test('shows the current user in the left sidebar profile card', async () => {
    routed({ '/api/connections/friends': { friends: [] }, '/api/feed/': { posts: [] } })
    render(<FeedPage currentUser={currentUser} />)
    expect(await screen.findAllByText('Alex Rivera')).not.toHaveLength(0)
  })
})
