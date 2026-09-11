import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ProfilePage from './ProfilePage'

const currentUser = {
  id: 'me', name: 'Alex Rivera', handle: '@alex', avatarSrc: null, coverColor: '#123',
  stats: { posts: 5, followers: 10, following: 2 },
}

beforeEach(() => {
  global.fetch.mockReset()
  global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ friends: [] }) })
})

describe('ProfilePage', () => {
  test('fetches the friends list on mount', async () => {
    render(<ProfilePage currentUser={currentUser} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/connections/friends', expect.objectContaining({ credentials: 'include' })))
  })

  test('renders the profile card, activity graph and friends panel', async () => {
    render(<ProfilePage currentUser={currentUser} />)
    expect(await screen.findAllByText('Alex Rivera')).not.toHaveLength(0)
    expect(screen.getByText(/contributions in the last year/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Friends' })).toBeInTheDocument()
  })
})
