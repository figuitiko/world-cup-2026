import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('admin bulk actions confirmation modals', () => {
  it('uses confirmation dialogs for all admin bulk assignment buttons', () => {
    const pageSource = readProjectFile('app/(admin)/admin/user-picks/page.tsx')
    const actionsSource = readProjectFile('app/(admin)/admin/user-picks/admin-bulk-actions.tsx')

    expect(pageSource).toContain('AdminBulkActions')
    expect(actionsSource).toContain('autoAssignMissingChampions')
    expect(actionsSource).toContain('autoAssignMissingTopScorers')
    expect(actionsSource).toContain('autoAssignMissingPicks')
    expect(actionsSource).toContain('Dialog')
    expect(actionsSource).toContain('Asignar campeones faltantes')
    expect(actionsSource).toContain('Asignar goleadores faltantes')
    expect(actionsSource).toContain('Asignar picks faltantes')
    expect(actionsSource).toContain('Confirmar')
    expect(pageSource).not.toContain('<form')
  })
})
