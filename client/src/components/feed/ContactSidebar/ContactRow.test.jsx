import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactRow from './ContactRow'

const contact = { id: 'u2', name: 'Sam Lee', handle: '@sam', avatarSrc: null, online: true }

describe('ContactRow', () => {
  test('renders the contact name and handle', () => {
    render(<ContactRow contact={contact} onMessage={vi.fn()} />)
    expect(screen.getByText('Sam Lee')).toBeInTheDocument()
    expect(screen.getByText('@sam')).toBeInTheDocument()
  })

  test('clicking the row calls onMessage with the contact id', async () => {
    const onMessage = vi.fn()
    const { container } = render(<ContactRow contact={contact} onMessage={onMessage} />)
    await userEvent.click(container.querySelector('.contact-row'))
    expect(onMessage).toHaveBeenCalledWith('u2')
  })

  test('the message button also calls onMessage (once, not bubbling twice)', async () => {
    const onMessage = vi.fn()
    render(<ContactRow contact={contact} onMessage={onMessage} />)
    await userEvent.click(screen.getByRole('button', { name: 'Message Sam Lee' }))
    expect(onMessage).toHaveBeenCalledTimes(1)
    expect(onMessage).toHaveBeenCalledWith('u2')
  })
})
