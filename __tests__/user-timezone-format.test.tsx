import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserTimezoneDateTime } from '@/components/user-timezone-date-time'

describe('UserTimezoneDateTime', () => {
  it('formats match kickoff in the browser timezone', () => {
    render(<UserTimezoneDateTime value="2026-06-11T23:00:00.000Z" />)

    const time = screen.getByText(/11 jun/i)

    expect(time).toHaveTextContent(/p\.\s*m\.|a\.\s*m\./i)
    expect(time).toHaveAttribute('title', expect.stringContaining('UTC'))
  })
})
