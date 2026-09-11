import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactSidebar from './ContactSidebar'

const contacts = [
  { id: 'a', name: 'Online One', handle: '@o1', avatarSrc: null, online: true },
  { id: 'b', name: 'Offline Two', handle: '@o2', avatarSrc: null, online: false },
]

describe('ContactSidebar', () => {
  test('splits contacts into Online and Offline sections', () => {
    render(<ContactSidebar contacts={contacts} onMessage={vi.fn()} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.getByText('Offline')).toBeInTheDocument()
    expect(screen.getByText('Online One')).toBeInTheDocument()
    expect(screen.getByText('Offline Two')).toBeInTheDocument()
  })

  test('omits a section with no contacts', () => {
    render(<ContactSidebar contacts={[contacts[0]]} onMessage={vi.fn()} />)
    expect(screen.queryByText('Offline')).not.toBeInTheDocument()
  })

  test('clicking a contact row bubbles the id to onMessage', async () => {
    const onMessage = vi.fn()
    const { container } = render(<ContactSidebar contacts={contacts} onMessage={onMessage} />)
    await userEvent.click(container.querySelector('.contact-row'))
    expect(onMessage).toHaveBeenCalledWith('a')
  })
})
