import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

describe('theme color tokens', () => {
  it('uses the TRIONDA Stadium palette as semantic theme tokens', () => {
    expect(globalsCss).toContain('--background: #fffbeb;')
    expect(globalsCss).toContain('--foreground: #08111f;')
    expect(globalsCss).toContain('--primary: #008764;')
    expect(globalsCss).toContain('--secondary: #1d4ed8;')
    expect(globalsCss).toContain('--accent: #fbbf24;')
    expect(globalsCss).toContain('--destructive: #dc2626;')
    expect(globalsCss).toContain('--ring: #008764;')
  })
})
