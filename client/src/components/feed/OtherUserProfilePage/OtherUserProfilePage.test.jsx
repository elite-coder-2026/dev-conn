import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import OtherUserProfilePage from './OtherUserProfilePage'

beforeEach(() => { global.fetch.mockReset() })

describe('OtherUserProfilePage', () => {
  test('renders nothing until the user has loaded', () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(null) })
    const { container } = render(<OtherUserProfilePage userId="u2" />)
    expect(container).toBeEmptyDOMElement()
  })

  test('fetches the given user and renders their profile card', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 'u2', name: 'Jordan Blake', handle: '@jordan',
        avatar_url: null, cover_color: '#222',
        posts_count: 4, followers_count: 10, following_count: 2,
      }),
    })
    render(<OtherUserProfilePage userId="u2" />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/users/u2', expect.objectContaining({ credentials: 'include' })))
    expect(await screen.findByText('Jordan Blake')).toBeInTheDocument()
    expect(screen.getByText('@jordan')).toBeInTheDocument()
  })

  test('does not fetch when no userId is given', () => {
    render(<OtherUserProfilePage />)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
