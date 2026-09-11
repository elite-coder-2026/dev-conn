import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppHeader from './AppHeader'

const currentUser = { name: 'Alex Rivera', avatar_url: null }

function baseProps(over = {}) {
  return { activeNav: 'feed', setActiveNav: vi.fn(), onSearch: vi.fn(), onLogout: vi.fn(), currentUser, ...over }
}

beforeEach(() => {
  global.fetch.mockReset()
  global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
})

describe('AppHeader', () => {
  test('fetches notifications on mount', async () => {
    render(<AppHeader {...baseProps()} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/notifications', expect.objectContaining({ credentials: 'include' })))
  })

  test('a nav link calls setActiveNav with its id', async () => {
    const setActiveNav = vi.fn()
    render(<AppHeader {...baseProps({ setActiveNav })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Discover' }))
    expect(setActiveNav).toHaveBeenCalledWith('discover')
  })

  test('submitting the search calls onSearch with the trimmed query', async () => {
    const onSearch = vi.fn()
    render(<AppHeader {...baseProps({ onSearch })} />)
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), '  react  {Enter}')
    expect(onSearch).toHaveBeenCalledWith('react')
  })

  test('the avatar button navigates to the profile view', async () => {
    const setActiveNav = vi.fn()
    render(<AppHeader {...baseProps({ setActiveNav })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Profile' }))
    expect(setActiveNav).toHaveBeenCalledWith('profile')
  })

  test('Log out calls onLogout', async () => {
    const onLogout = vi.fn()
    render(<AppHeader {...baseProps({ onLogout })} />)
    await userEvent.click(screen.getByRole('button', { name: /log out/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  test('toggling the bell opens the notifications dropdown', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([
      { id: 'n1', type: 'like', name: 'Sam', message: 'liked your post', timeAgo: '1h', read: false },
    ]) })
    render(<AppHeader {...baseProps()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(await screen.findByText('liked your post')).toBeInTheDocument()
  })
})
