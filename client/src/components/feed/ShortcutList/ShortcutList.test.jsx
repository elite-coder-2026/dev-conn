import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ShortcutList from './ShortcutList'

describe('ShortcutList', () => {
  test('renders the four shortcut entries inside a labelled nav', () => {
    render(<ShortcutList />)
    expect(screen.getByRole('navigation', { name: /shortcuts/i })).toBeInTheDocument()
    for (const label of ['Feed', 'Messages', 'Friends', 'Discover']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })
})
