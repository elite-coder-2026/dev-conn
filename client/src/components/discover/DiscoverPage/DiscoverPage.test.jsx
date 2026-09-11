import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscoverPage from './DiscoverPage'

const discoverUsers = [
  { id: 'u2', name: 'Jordan Blake', handle: '@jordan', avatarUrl: null, isOnline: true, followersCount: 5, connection: {} },
]

beforeEach(() => { global.fetch.mockReset() })

describe('DiscoverPage', () => {
  test('loads suggestions from /api/connections/discover', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ users: discoverUsers }) })
    render(<DiscoverPage />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/connections/discover', expect.objectContaining({ credentials: 'include' })))
    expect(await screen.findByText('Jordan Blake')).toBeInTheDocument()
  })

  test('Add Friend POSTs a request and flips the button to Requested', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: discoverUsers }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'req-1' }) })

    render(<DiscoverPage />)
    const addBtn = await screen.findByRole('button', { name: /add friend/i })
    await userEvent.click(addBtn)

    const postCall = global.fetch.mock.calls.find(([u]) => u === '/api/connections/requests')
    expect(postCall).toBeTruthy()
    expect(JSON.parse(postCall[1].body)).toEqual({ recipient_id: 'u2' })
    expect(await screen.findByRole('button', { name: /requested/i })).toBeInTheDocument()
  })
})
