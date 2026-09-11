import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationsDropdown from './NotificationsDropdown'

const notifs = [
  { id: 'n1', type: 'like', name: 'Alex', message: 'liked your post', timeAgo: '2h', read: false },
  { id: 'n2', type: 'comment', name: 'Sam', message: 'commented', timeAgo: '1d', read: true },
]

describe('NotificationsDropdown', () => {
  test('shows the empty state when there are no notifications', () => {
    render(<NotificationsDropdown notifications={[]} onClose={vi.fn()} onMarkAllRead={vi.fn()} />)
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mark all as read/i })).not.toBeInTheDocument()
  })

  test('renders a row per notification and a Mark-all button when some are unread', () => {
    render(<NotificationsDropdown notifications={notifs} onClose={vi.fn()} onMarkAllRead={vi.fn()} />)
    expect(screen.getByText('liked your post')).toBeInTheDocument()
    expect(screen.getByText('commented')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument()
  })

  test('Mark all as read calls onMarkAllRead', async () => {
    const onMarkAllRead = vi.fn()
    render(<NotificationsDropdown notifications={notifs} onClose={vi.fn()} onMarkAllRead={onMarkAllRead} />)
    await userEvent.click(screen.getByRole('button', { name: /mark all as read/i }))
    expect(onMarkAllRead).toHaveBeenCalledOnce()
  })

  test('a mousedown outside the dropdown calls onClose', async () => {
    const onClose = vi.fn()
    render(<NotificationsDropdown notifications={notifs} onClose={onClose} onMarkAllRead={vi.fn()} />)
    await userEvent.click(document.body)
    expect(onClose).toHaveBeenCalled()
  })
})
