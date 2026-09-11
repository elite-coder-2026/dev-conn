import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessagesPage from './MessagesPage'

const currentUser = { id: 'me', name: 'Me', avatarSrc: null }
const inbox = [
  {
    conversation_id: 'conv-1', other_user_id: 'u2', other_user_name: 'Jordan Blake',
    other_user_handle: '@jordan', other_user_avatar_url: null, other_user_is_online: true,
    last_message_body: 'see you then', last_message_at: new Date().toISOString(),
    last_message_sender_id: 'u2', unread_count: 2,
  },
]

function routed(map) {
  global.fetch.mockImplementation((url, opts) => {
    const key = Object.keys(map).find(k => String(url).includes(k))
    const val = typeof map[key] === 'function' ? map[key](opts) : map[key]
    return Promise.resolve({ ok: true, json: () => Promise.resolve(val ?? {}) })
  })
}

beforeEach(() => { global.fetch.mockReset() })

describe('MessagesPage', () => {
  test('loads the inbox and shows the first conversation thread', async () => {
    routed({
      '/api/dm/inbox': inbox,
      '/messages': { messages: [{ id: 'm1', sender_id: 'u2', body: 'hello you' }] },
    })
    render(<MessagesPage currentUser={currentUser} />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/dm/inbox', expect.objectContaining({ credentials: 'include' })))
    expect(await screen.findAllByText('Jordan Blake')).not.toHaveLength(0)
    expect(await screen.findByText('hello you')).toBeInTheDocument()
  })

  test('shows an empty state when the inbox is empty', async () => {
    routed({ '/api/dm/inbox': [] })
    render(<MessagesPage currentUser={currentUser} />)
    expect(await screen.findByText(/no conversations yet/i)).toBeInTheDocument()
  })

  test('sending a message POSTs to the active conversation', async () => {
    routed({
      '/api/dm/inbox': inbox,
      '/messages': (opts) => opts?.method === 'POST'
        ? { id: 'm2', sender_id: 'me', body: 'on my way' }
        : { messages: [] },
    })
    render(<MessagesPage currentUser={currentUser} />)

    const input = await screen.findByPlaceholderText(/message jordan/i)
    await userEvent.type(input, 'on my way')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    const postCall = global.fetch.mock.calls.find(([u, o]) => String(u).includes('/conversations/conv-1/messages') && o?.method === 'POST')
    expect(postCall).toBeTruthy()
    expect(JSON.parse(postCall[1].body)).toEqual({ body: 'on my way' })
    expect(await screen.findByText('on my way')).toBeInTheDocument()
  })
})
