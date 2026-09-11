import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostCard from './PostCard'

const basePost = {
  id: 'p1', type: 'text', content: 'the post body',
  author: { name: 'Alex Rivera', handle: '@alex', avatarSrc: null },
  timeAgo: '2h', likedByMe: false, sharedByMe: false, likes: 3, comments: 1, shares: 0,
}

function jsonRes(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: () => Promise.resolve(body) })
}

beforeEach(() => { global.fetch.mockReset() })

describe('PostCard', () => {
  test('renders author, body and the action counts', () => {
    render(<PostCard post={basePost} currentUser={{}} />)
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
    expect(screen.getByText('the post body')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3 likes' })).toBeInTheDocument()
  })

  test('liking POSTs to the like endpoint and updates the count from the response', async () => {
    global.fetch.mockReturnValueOnce(jsonRes({ likes_count: 4 }))
    render(<PostCard post={basePost} currentUser={{}} />)

    await userEvent.click(screen.getByRole('button', { name: '3 likes' }))

    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/posts/p1/like')
    expect(opts.method).toBe('POST')
    await waitFor(() => expect(screen.getByRole('button', { name: '4 likes' })).toBeInTheDocument())
  })

  test('opening comments fetches them from the post comments endpoint', async () => {
    global.fetch.mockReturnValueOnce(jsonRes([
      { id: 'c1', author_name: 'Sam', author_handle: '@sam', author_avatar_url: null, created_at: new Date().toISOString(), content: 'great' },
    ]))
    render(<PostCard post={basePost} currentUser={{}} />)

    await userEvent.click(screen.getByRole('button', { name: '1 comments' }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/posts/p1/comments', expect.objectContaining({ credentials: 'include' })))
    expect(await screen.findByText('great')).toBeInTheDocument()
  })

  test('a non-owner sees no Edit / Delete in the menu', async () => {
    render(<PostCard post={basePost} currentUser={{ handle: '@someone-else' }} />)
    await userEvent.click(screen.getByRole('button', { name: /more options/i }))
    expect(screen.queryByRole('button', { name: /delete post/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit post/i })).not.toBeInTheDocument()
  })

  test('the owner sees Edit / Delete in the menu', async () => {
    render(<PostCard post={basePost} currentUser={{ handle: '@alex' }} />)
    await userEvent.click(screen.getByRole('button', { name: /more options/i }))
    expect(screen.getByRole('button', { name: /delete post/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit post/i })).toBeInTheDocument()
  })

  test('deleting as the owner calls DELETE and then onDelete', async () => {
    global.fetch.mockReturnValueOnce(jsonRes({}, true))
    const onDelete = vi.fn()
    render(<PostCard post={basePost} currentUser={{ handle: '@alex' }} onDelete={onDelete} />)

    await userEvent.click(screen.getByRole('button', { name: /more options/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete post/i }))

    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/posts/p1')
    expect(opts.method).toBe('DELETE')
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('p1'))
  })
})
