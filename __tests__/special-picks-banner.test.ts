import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('special picks deadline banner', () => {
  it('is implemented as a global red alert instead of a picks-only banner', () => {
    const layoutSource = readProjectFile('app/layout.tsx')
    const bannerSource = readProjectFile('components/top-scorer-deadline-banner.tsx')

    expect(layoutSource).toContain('TopScorerDeadlineBanner')
    expect(bannerSource).toContain('NEXT_PUBLIC_TOP_SCORER_DEADLINE_BANNER')
    expect(bannerSource).toContain('role="alert"')
    expect(bannerSource).toContain('bg-destructive')
    expect(bannerSource).toContain('Goleador se bloquea')
  })
})
