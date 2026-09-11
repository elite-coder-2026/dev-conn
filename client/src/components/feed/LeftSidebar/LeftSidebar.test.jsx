import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LeftSidebar from './LeftSidebar'

const currentUser = { name: 'Alex Rivera', handle: '@alex', avatarSrc: null, coverColor: '#123', stats: { posts: 0, followers: 0, following: 0 } }

describe('LeftSidebar', () => {
  test('renders the profile card and the shortcut nav', () => {
    render(<LeftSidebar currentUser={currentUser} />)
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /shortcuts/i })).toBeInTheDocument()
  })
})
