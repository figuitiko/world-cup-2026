import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('admin users UI', () => {
  it('exposes user management from the admin navigation', () => {
    const source = readProjectFile('app/(admin)/layout.tsx')

    expect(source).toContain('href="/admin/users"')
    expect(source).toContain('Usuarios')
  })

  it('adds list, create, and edit screens for admin user CRUD', () => {
    const listSource = readProjectFile('app/(admin)/admin/users/page.tsx')
    const newSource = readProjectFile('app/(admin)/admin/users/new/page.tsx')
    const editSource = readProjectFile('app/(admin)/admin/users/[id]/edit/page.tsx')
    const formSource = readProjectFile('app/(admin)/admin/users/user-form.tsx')

    expect(listSource).toContain('Administrar usuarios')
    expect(listSource).toContain('deleteUser')
    expect(newSource).toContain('Nuevo usuario')
    expect(editSource).toContain('Editar usuario')
    expect(formSource).toContain('createUser')
    expect(formSource).toContain('updateUser')
    expect(formSource).toContain('isAdmin')
  })
})
