import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('favicon assets', () => {
  it('provides a generated ICO favicon and PNG app icon from the TRIONDA ball', () => {
    const favicon = readFileSync(join(process.cwd(), 'app/favicon.ico'))
    const icon = readFileSync(join(process.cwd(), 'app/icon.png'))

    expect(favicon.subarray(0, 4).toString('hex')).toBe('00000100')
    expect(icon.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  })
})
