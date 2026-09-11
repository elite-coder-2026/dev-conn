import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileCard from './ProfileCard'

const user = {
  name: 'Alex Rivera', handle: '@alex', avatarSrc: null, coverColor: '#123',
  stats: { posts: 1200, followers: 3, following: 0 },
}

describe('ProfileCard', () => {
  test('shows name, handle and stat labels', () => {
    render(<ProfileCard user={user} />)
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
    expect(screen.getByText('@alex')).toBeInTheDocument()
    expect(screen.getByText('Followers')).toBeInTheDocument()
  })

  test('formats a stat over 1000 as "1.2k"', () => {
    render(<ProfileCard user={user} />)
    expect(screen.getByText('1.2k')).toBeInTheDocument()
  })
})
