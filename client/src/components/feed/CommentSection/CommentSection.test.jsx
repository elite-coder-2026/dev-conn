import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentSection from './CommentSection'

const currentUser = { name: 'Me', handle: '@me', avatarSrc: null }
const comments = [
  {
    id: 'c1',
    author: { name: 'Alex Rivera', handle: '@alex', avatarSrc: null },
    timeAgo: '2h',
    text: 'nice work',
    replies: [
      { id: 'r1', author: { name: 'Sam', handle: '@sam', avatarSrc: null }, timeAgo: '1h', text: 'agreed' },
    ],
  },
]

describe('CommentSection', () => {
  test('renders existing comments and their replies', () => {
    render(<CommentSection comments={comments} currentUser={currentUser} onAddComment={vi.fn()} onAddReply={vi.fn()} />)
    expect(screen.getByText('nice work')).toBeInTheDocument()
    expect(screen.getByText('agreed')).toBeInTheDocument()
  })

  test('the Post button appears only after typing and submits the trimmed text', async () => {
    const onAddComment = vi.fn()
    render(<CommentSection comments={[]} currentUser={currentUser} onAddComment={onAddComment} onAddReply={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Post' })).not.toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText(/write a comment/i), '  hello  ')
    await userEvent.click(screen.getByRole('button', { name: 'Post' }))

    expect(onAddComment).toHaveBeenCalledWith('hello')
  })

  test('Reply reveals an input and submits via onAddReply with the comment id', async () => {
    const onAddReply = vi.fn()
    render(<CommentSection comments={comments} currentUser={currentUser} onAddComment={vi.fn()} onAddReply={onAddReply} />)

    await userEvent.click(screen.getByRole('button', { name: 'Reply' }))
    const replyBox = screen.getByPlaceholderText(/reply to alex rivera/i)
    await userEvent.type(replyBox, 'thanks')

    // Once text is entered a second "Reply" button (the submit) appears.
    const replyButtons = screen.getAllByRole('button', { name: 'Reply' })
    await userEvent.click(replyButtons.at(-1))

    expect(onAddReply).toHaveBeenCalledWith('c1', 'thanks')
  })

  test('Enter submits a comment without a newline', async () => {
    const onAddComment = vi.fn()
    render(<CommentSection comments={[]} currentUser={currentUser} onAddComment={onAddComment} onAddReply={vi.fn()} />)
    const box = screen.getByPlaceholderText(/write a comment/i)
    await userEvent.type(box, 'quick{Enter}')
    expect(onAddComment).toHaveBeenCalledWith('quick')
  })
})
