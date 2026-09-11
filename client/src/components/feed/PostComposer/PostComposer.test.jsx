import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostComposer from './PostComposer'

const user = { name: 'Alex Rivera', handle: 'alex', avatarSrc: null }

beforeEach(() => { global.fetch.mockReset() })

describe('PostComposer', () => {
  test('starts collapsed and expands on focus', async () => {
    render(<PostComposer user={user} onPost={vi.fn()} />)
    const trigger = screen.getByPlaceholderText(/what's on your mind, alex/i)
    expect(screen.queryByRole('button', { name: 'Post' })).not.toBeInTheDocument()

    await userEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument()
  })

  test('Post is disabled until text is entered', async () => {
    render(<PostComposer user={user} onPost={vi.fn()} />)
    await userEvent.click(screen.getByPlaceholderText(/what's on your mind/i))
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled()

    await userEvent.type(screen.getByRole('textbox'), 'hello world')
    expect(screen.getByRole('button', { name: 'Post' })).toBeEnabled()
  })

  test('submitting posts the content to /api/posts/ and calls onPost with the saved post', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'p9', content: 'hello world', author_name: 'Alex Rivera', author_handle: '@alex', author_avatar_url: null, image_url: null }),
    })
    const onPost = vi.fn()
    render(<PostComposer user={user} onPost={onPost} />)

    await userEvent.click(screen.getByPlaceholderText(/what's on your mind/i))
    await userEvent.type(screen.getByRole('textbox'), 'hello world')
    await userEvent.click(screen.getByRole('button', { name: 'Post' }))

    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/posts/')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ content: 'hello world' })
    await waitFor(() => expect(onPost).toHaveBeenCalledWith(expect.objectContaining({ id: 'p9', content: 'hello world' })))
  })
})
