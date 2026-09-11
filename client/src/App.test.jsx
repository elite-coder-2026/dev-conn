import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

beforeEach(() => { global.fetch.mockReset() })

describe('App auth gating', () => {
  test('renders the auth page when /api/users/me is unauthorized', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('/api/users/me')) {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve(null) })
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(null) })
    })

    render(<App />)
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('renders the auth page when the session check throws', async () => {
    global.fetch.mockRejectedValue(new Error('offline'))
    render(<App />)
    await waitFor(() => expect(screen.queryByRole('button', { name: /sign in/i })).toBeInTheDocument())
  })
})
