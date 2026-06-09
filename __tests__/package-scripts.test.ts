import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))

describe('package scripts', () => {
  it('generates the Prisma client before the Vercel build compiles Next.js', () => {
    expect(packageJson.scripts.build).toMatch(/^prisma generate && next build$/)
  })
})
