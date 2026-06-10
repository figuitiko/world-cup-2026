import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('admin user picks UI', () => {
  it('includes admins in the editable user selector and labels them clearly', () => {
    const source = readProjectFile('app/(admin)/admin/user-picks/page.tsx')

    expect(source).not.toContain('where: { isAdmin: false }')
    expect(source).toContain('isAdmin')
    expect(source).toContain('Admin')
  })
})
