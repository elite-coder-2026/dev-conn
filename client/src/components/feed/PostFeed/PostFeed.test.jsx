import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostFeed from './PostFeed'

function post(id, name) {
  return {
    id, type: 'text', content: `body ${id}`,
    author: { name, handle: `@${name}`, avatarSrc: null },
    timeAgo: '1h', likedByMe: false, sharedByMe: false, likes: 0, comments: 0, shares: 0,
  }
}

describe('PostFeed', () => {
  test('renders a PostCard for every post', () => {
    render(<PostFeed posts={[post('p1', 'Ada'), post('p2', 'Bob')]} currentUser={{}} onDelete={vi.fn()} onShare={vi.fn()} />)
    expect(screen.getByText('body p1')).toBeInTheDocument()
    expect(screen.getByText('body p2')).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
  })

  test('renders an empty container when there are no posts', () => {
    const { container } = render(<PostFeed posts={[]} currentUser={{}} onDelete={vi.fn()} onShare={vi.fn()} />)
    expect(container.querySelectorAll('.post-card')).toHaveLength(0)
  })
})
