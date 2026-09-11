import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VideoList from './VideoList'

const videos = [
  { id: 'v1', videoUrl: 'https://x/1', title: 'First', description: 'one', views: 1234, timeAgo: '2h' },
  { id: 'v2', videoUrl: 'https://x/2', title: 'Second', description: 'two', views: 10, timeAgo: '1d' },
]

describe('VideoList', () => {
  test('renders the heading and a card per video', () => {
    const { container } = render(<VideoList videos={videos} />)
    expect(screen.getByRole('heading', { name: 'Videos' })).toBeInTheDocument()
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(container.querySelectorAll('.video-list__card')).toHaveLength(2)
  })

  test('formats the view count with thousands separators', () => {
    render(<VideoList videos={videos} />)
    expect(screen.getByText(/1,234 views/)).toBeInTheDocument()
  })
})
