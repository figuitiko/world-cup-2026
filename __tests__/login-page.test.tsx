import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import LoginPage from '@/app/(auth)/login/page'

describe('LoginPage', () => {
  it('links to the public leaderboard from the login page', () => {
    render(<LoginPage />)

    const leaderboardLink = screen.getByRole('link', { name: /ver tabla/i })

    expect(leaderboardLink).toHaveAttribute('href', '/leaderboard')
  })
})
