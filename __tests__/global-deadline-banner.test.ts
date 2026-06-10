import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('global top scorer deadline banner', () => {
  it('renders the feature-flagged red alert from the root layout', () => {
    const layoutSource = readProjectFile('app/layout.tsx')
    const bannerSource = readProjectFile('components/top-scorer-deadline-banner.tsx')
    const picksSource = readProjectFile('app/(app)/picks/page.tsx')

    expect(layoutSource).toContain('TopScorerDeadlineBanner')
    expect(bannerSource).toContain('NEXT_PUBLIC_TOP_SCORER_DEADLINE_BANNER')
    expect(bannerSource).toContain('role="alert"')
    expect(bannerSource).toContain('bg-destructive')
    expect(bannerSource).toContain('Goleador se bloquea')
    expect(picksSource).not.toContain('showTopScorerDeadlineBanner')
  })
})
