import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('admin random top scorer UI', () => {
  it('exposes bulk random top scorer assignment only on the admin bulk actions component', () => {
    const adminSource = readProjectFile('app/(admin)/admin/user-picks/admin-bulk-actions.tsx')
    const userFormSource = readProjectFile('components/special-picks-form.tsx')

    expect(adminSource).toContain('autoAssignMissingTopScorers')
    expect(adminSource).toContain('Asignar goleadores faltantes')
    expect(userFormSource).not.toContain('Asignar goleador al azar')
  })
})
