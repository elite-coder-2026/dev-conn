import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReactionPicker from './ReactionPicker'

describe('ReactionPicker', () => {
  test('renders all five reactions', () => {
    render(<ReactionPicker onSelect={vi.fn()} />)
    for (const label of ['Like', 'Dislike', 'Love', 'Care', 'Angry']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  test('clicking a reaction calls onSelect with its key', async () => {
    const onSelect = vi.fn()
    render(<ReactionPicker onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: 'Love' }))
    expect(onSelect).toHaveBeenCalledWith('love')
  })
})
