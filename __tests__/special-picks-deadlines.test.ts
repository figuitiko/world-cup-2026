import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('special picks deadlines', () => {
  it('passes separate champion and scorer deadline locks to the form', () => {
    const picksSource = readProjectFile('app/(app)/picks/page.tsx')

    expect(picksSource).toContain('championDeadlineLocked')
    expect(picksSource).toContain('topScorerDeadlineLocked')
    expect(picksSource).toContain("orderBy: { kickoff: 'desc' }")
  })

  it('banner explains top scorer blocks before first match and champion after group phase', () => {
    const bannerSource = readProjectFile('components/top-scorer-deadline-banner.tsx')

    expect(bannerSource).toContain('Goleador se bloquea antes del primer partido')
    expect(bannerSource).toContain('Campeón se bloquea después del último partido de la fase de grupos')
  })
})
