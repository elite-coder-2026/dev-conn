import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatWindow from './ChatWindow'

const contact = { id: 'u2', name: 'Sam Lee', avatarSrc: null }
const chat = { minimized: false, isTyping: false, messages: [{ id: 'm1', text: 'hey', fromMe: false }] }

function setup(overrides = {}) {
  const props = {
    contact, chat,
    onMinimize: vi.fn(), onClose: vi.fn(), onAnimationEnd: vi.fn(), onSendMessage: vi.fn(),
    ...overrides,
  }
  render(<ChatWindow {...props} />)
  return props
}

describe('ChatWindow', () => {
  test('shows the contact name and existing messages', () => {
    setup()
    expect(screen.getByText('Sam Lee')).toBeInTheDocument()
    expect(screen.getByText('hey')).toBeInTheDocument()
  })

  test('typing and submitting sends the trimmed text with the contact id, then clears', async () => {
    const { onSendMessage } = setup()
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '  hello there  {Enter}')
    expect(onSendMessage).toHaveBeenCalledWith('u2', 'hello there')
    expect(input).toHaveValue('')
  })

  test('does not send an empty message', async () => {
    const { onSendMessage } = setup()
    await userEvent.type(screen.getByRole('textbox'), '   {Enter}')
    expect(onSendMessage).not.toHaveBeenCalled()
  })
})
