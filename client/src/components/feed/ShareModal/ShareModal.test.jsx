import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareModal from './ShareModal'

const post = {
  author: { name: 'Alex Rivera', handle: '@alex', avatarSrc: null },
  timeAgo: '3h',
  content: 'original post body',
}

function setup(overrides = {}) {
  const props = { post, onClose: vi.fn(), onShare: vi.fn(), ...overrides }
  render(<ShareModal {...props} />)
  return props
}

describe('ShareModal', () => {
  test('renders the shared post author and content', () => {
    setup()
    expect(screen.getByRole('dialog', { name: /share post/i })).toBeInTheDocument()
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
    expect(screen.getByText('original post body')).toBeInTheDocument()
  })

  test('the close button calls onClose', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('pressing Escape calls onClose', async () => {
    const { onClose } = setup()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('the share action passes the typed description to onShare', async () => {
    const { onShare } = setup()
    const box = screen.getByRole('textbox')
    await userEvent.type(box, 'look at this')
    await userEvent.click(screen.getByRole('button', { name: /^share$/i }))
    expect(onShare).toHaveBeenCalledWith('look at this')
  })
})
