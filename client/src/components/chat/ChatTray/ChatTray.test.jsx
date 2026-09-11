import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatTray from './ChatTray'

const contacts = [
  { id: 'u2', name: 'Sam Lee', avatarSrc: null },
  { id: 'u3', name: 'Dana Fox', avatarSrc: null },
]

describe('ChatTray', () => {
  test('renders a ChatWindow for each chat matched to a contact', () => {
    const chats = [
      { contactId: 'u2', minimized: false, messages: [] },
      { contactId: 'u3', minimized: false, messages: [] },
    ]
    render(<ChatTray chats={chats} contacts={contacts} onMinimize={vi.fn()} onClose={vi.fn()} onRemove={vi.fn()} onSendMessage={vi.fn()} />)
    expect(screen.getByText('Sam Lee')).toBeInTheDocument()
    expect(screen.getByText('Dana Fox')).toBeInTheDocument()
  })

  test('skips chats whose contact is unknown', () => {
    const chats = [{ contactId: 'ghost', minimized: false, messages: [] }]
    const { container } = render(<ChatTray chats={chats} contacts={contacts} onMinimize={vi.fn()} onClose={vi.fn()} onRemove={vi.fn()} onSendMessage={vi.fn()} />)
    expect(container.querySelectorAll('.chat-window')).toHaveLength(0)
  })

  test('renders nothing when there are no chats', () => {
    const { container } = render(<ChatTray chats={[]} contacts={contacts} onMinimize={vi.fn()} onClose={vi.fn()} onRemove={vi.fn()} onSendMessage={vi.fn()} />)
    expect(container.querySelectorAll('.chat-window')).toHaveLength(0)
  })
})
