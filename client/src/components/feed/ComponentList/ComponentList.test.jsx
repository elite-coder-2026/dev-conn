import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComponentList from './ComponentList'

const components = [
  { id: 'c1', name: 'Button', timeAgo: '2h', description: 'A button', tags: ['ui', 'form'], stars: 12, forks: 3 },
  { id: 'c2', name: 'Modal', timeAgo: '1d', description: 'A modal', tags: ['overlay'], stars: 5, forks: 1 },
]

describe('ComponentList', () => {
  test('renders a row per component with its metadata', () => {
    render(<ComponentList components={components} />)
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('A modal')).toBeInTheDocument()
    expect(screen.getByText('ui')).toBeInTheDocument()
    expect(screen.getByText('★ 12')).toBeInTheDocument()
  })

  test('renders just the heading when the list is empty', () => {
    const { container } = render(<ComponentList components={[]} />)
    expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument()
    expect(container.querySelectorAll('.component-list__item')).toHaveLength(0)
  })
})
