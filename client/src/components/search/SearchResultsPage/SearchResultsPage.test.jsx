import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import SearchResultsPage from './SearchResultsPage'

beforeEach(() => { global.fetch.mockReset() })

function routed(map) {
  global.fetch.mockImplementation((url) => {
    const key = Object.keys(map).find(k => String(url).includes(k))
    return Promise.resolve({ ok: true, json: () => Promise.resolve(map[key] ?? {}) })
  })
}

describe('SearchResultsPage', () => {
  test('shows the query in the heading', () => {
    routed({})
    render(<SearchResultsPage query="design systems" />)
    expect(screen.getByRole('heading', { name: /results for/i })).toHaveTextContent('design systems')
  })

  test('queries both the user and feed search endpoints with the encoded term', async () => {
    routed({ '/api/users/search': { users: [] }, '/api/feed/search': { posts: [] } })
    render(<SearchResultsPage query="a b" />)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users/search?q=a%20b'), expect.any(Object))
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/feed/search?q=a%20b'), expect.any(Object))
    })
  })

  test('renders people and post results', async () => {
    routed({
      '/api/users/search': { users: [{ id: 'u1', name: 'Alex Rivera', handle: '@alex', avatar_url: null, is_online: true }] },
      '/api/feed/search': { posts: [{ id: 'p1', author_name: 'Alex Rivera', author_handle: '@alex', author_avatar_url: null, content: 'hello post' }] },
    })
    render(<SearchResultsPage query="alex" />)
    expect(await screen.findByText('hello post')).toBeInTheDocument()
    expect(screen.getAllByText('Alex Rivera').length).toBeGreaterThan(0)
  })

  test('shows empty states when nothing matches', async () => {
    routed({ '/api/users/search': { users: [] }, '/api/feed/search': { posts: [] } })
    render(<SearchResultsPage query="zzz" />)
    expect(await screen.findByText(/no people found/i)).toBeInTheDocument()
    expect(screen.getByText(/no posts found/i)).toBeInTheDocument()
  })
})
