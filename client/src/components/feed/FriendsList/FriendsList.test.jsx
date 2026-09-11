import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FriendsList from './FriendsList'

const contacts = [
  { id: 'a', name: 'Ada Online', handle: '@ada', avatarSrc: null, online: true },
  { id: 'b', name: 'Bob Offline', handle: '@bob', avatarSrc: null, online: false },
]

describe('FriendsList', () => {
  test('renders online and offline friends under their sections', () => {
    render(<FriendsList contacts={contacts} onMessage={vi.fn()} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.getByText('Offline')).toBeInTheDocument()
    expect(screen.getByText('Ada Online')).toBeInTheDocument()
    expect(screen.getByText('Bob Offline')).toBeInTheDocument()
  })

  test('clicking a friend row calls onMessage with the friend id', async () => {
    const onMessage = vi.fn()
    const { container } = render(<FriendsList contacts={contacts} onMessage={onMessage} />)
    await userEvent.click(container.querySelector('.friends-list__row'))
    expect(onMessage).toHaveBeenCalledWith('a')
  })
})
