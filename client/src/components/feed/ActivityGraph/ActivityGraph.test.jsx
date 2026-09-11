import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityGraph from './ActivityGraph'

describe('ActivityGraph', () => {
  test('renders the contributions heading and the Less/More legend', () => {
    render(<ActivityGraph />)
    expect(screen.getByText(/contributions in the last year/i)).toBeInTheDocument()
    expect(screen.getByText('Less')).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  test('renders a full year of day cells (~53 weeks)', () => {
    const { container } = render(<ActivityGraph />)
    const cells = container.querySelectorAll('.activity-graph__cell')
    expect(cells.length).toBeGreaterThan(360)
    expect(cells.length).toBeLessThan(372)
  })
})
