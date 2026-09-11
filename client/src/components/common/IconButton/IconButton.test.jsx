import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IconButton from './IconButton'

describe('IconButton', () => {
  test('uses label as the accessible name and fires onClick', async () => {
    const onClick = vi.fn()
    render(<IconButton label="Notifications" icon={<svg />} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  test('hides the badge when badge is 0 and caps it at 99+', () => {
    const { rerender } = render(<IconButton label="x" badge={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()

    rerender(<IconButton label="x" badge={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()

    rerender(<IconButton label="x" badge={150} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  test('adds the active modifier class when active', () => {
    const { container } = render(<IconButton label="x" active />)
    expect(container.querySelector('.icon-btn--active')).not.toBeNull()
  })
})
