import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('route-level UI polish states', () => {
  it('adds skeleton loading states to the key prediction journeys', () => {
    const loadingFiles = [
      'app/(app)/matches/loading.tsx',
      'app/(app)/picks/loading.tsx',
      'app/leaderboard/loading.tsx',
      'app/(admin)/admin/games/loading.tsx',
    ]

    for (const file of loadingFiles) {
      const source = readProjectFile(file)

      expect(source).toContain('animate-pulse')
      expect(source).toContain('rounded')
    }
  })

  it('adds recoverable route error boundaries that use Next 16 unstable_retry', () => {
    const errorFiles = ['app/(app)/error.tsx', 'app/(admin)/error.tsx', 'app/leaderboard/error.tsx']

    for (const file of errorFiles) {
      const source = readProjectFile(file)

      expect(source).toContain("'use client'")
      expect(source).toContain('unstable_retry')
      expect(source).toContain('Intentar de nuevo')
    }
  })

  it('adds a friendly app-wide not-found recovery screen', () => {
    const source = readProjectFile('app/not-found.tsx')

    expect(source).toContain('No encontramos esa pantalla')
    expect(source).toContain('href="/matches"')
    expect(source).toContain('href="/leaderboard"')
  })
})

describe('intentional empty and recovery copy', () => {
  it('uses designed empty states instead of placeholder-only copy', () => {
    const matchesSource = readProjectFile('app/(app)/matches/page.tsx')
    const adminGamesSource = readProjectFile('app/(admin)/admin/games/page.tsx')
    const adminCandidatesSource = readProjectFile('app/(admin)/admin/candidates/page.tsx')

    expect(matchesSource).toContain('CalendarDays')
    expect(matchesSource).toContain('Fixture en preparación')
    expect(adminGamesSource).toContain('Todavía no hay partidos')
    expect(adminCandidatesSource).toContain('Agregá candidatos')
  })
})
