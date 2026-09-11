import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Avatar from './Avatar'

describe('Avatar', () => {
  test('renders an <img> when src is provided', () => {
    render(<Avatar src="https://x/a.png" alt="Alex Rivera" />)
    const img = screen.getByRole('img', { name: 'Alex Rivera' })
    expect(img).toHaveAttribute('src', 'https://x/a.png')
  })

  test('falls back to initials (max 2) with an aria-label when no src', () => {
    render(<Avatar alt="Alex Rivera Jones" />)
    const fallback = screen.getByLabelText('Alex Rivera Jones')
    expect(fallback).toHaveTextContent('AR')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  test('shows the online dot only when online', () => {
    const { container, rerender } = render(<Avatar alt="A" />)
    expect(container.querySelector('.avatar__dot')).toBeNull()
    rerender(<Avatar alt="A" online />)
    expect(container.querySelector('.avatar__dot')).not.toBeNull()
  })

  test('applies the size modifier class', () => {
    const { container } = render(<Avatar alt="A" size="lg" />)
    expect(container.querySelector('.avatar--lg')).not.toBeNull()
  })
})
