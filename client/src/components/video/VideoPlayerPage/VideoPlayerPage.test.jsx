import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VideoPlayerPage from './VideoPlayerPage'

const currentUser = { name: 'Alex Rivera', handle: '@alex', avatarSrc: null }

beforeEach(() => {
  global.fetch.mockReset()
  global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ videos: [] }) })
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue()
  window.HTMLMediaElement.prototype.pause = vi.fn()
})

describe('VideoPlayerPage', () => {
  test('fetches the video list for the Up Next sidebar', async () => {
    render(<VideoPlayerPage currentUser={currentUser} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/videos', expect.objectContaining({ credentials: 'include' })))
  })

  test('renders related videos returned by the API', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ videos: [
        { id: 'v1', title: 'Token pipelines', uploader_name: 'Dana', duration: '10:00', thumb_color: '#111', views_count: 1200 },
      ] }),
    })
    render(<VideoPlayerPage currentUser={currentUser} />)
    expect(await screen.findByText('Token pipelines')).toBeInTheDocument()
  })

  test('the like button toggles the like count', async () => {
    render(<VideoPlayerPage currentUser={currentUser} />)
    const likeBtn = screen.getByRole('button', { name: 'Like' })
    expect(likeBtn).toHaveTextContent('4,821')
    await userEvent.click(likeBtn)
    expect(likeBtn).toHaveTextContent('4,822')
    await userEvent.click(likeBtn)
    expect(likeBtn).toHaveTextContent('4,821')
  })

  test('adding a comment prepends it and clears the input', async () => {
    render(<VideoPlayerPage currentUser={currentUser} />)
    const box = screen.getByPlaceholderText(/add a comment/i)
    await userEvent.type(box, 'great explanation')
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }))

    expect(screen.getByText('great explanation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /1 comments/i })).toBeInTheDocument()
    expect(box).toHaveValue('')
  })
})
