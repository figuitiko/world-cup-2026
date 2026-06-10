import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()

function readProjectFile(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8')
}

describe('admin bulk action button style', () => {
  it('renders all bulk action triggers with the same visual variant and width', () => {
    const source = readProjectFile('app/(admin)/admin/user-picks/admin-bulk-actions.tsx')

    expect(source).toContain('variant="destructive" size="sm" className="min-w-[200px]"')
    expect(source).not.toContain('variant={action.variant}')
    expect(source).not.toContain("variant: 'outline'")
  })
})
