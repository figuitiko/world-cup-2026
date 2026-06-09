import UserForm from '../user-form'

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo usuario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Creá una cuenta manual y definí si puede entrar al panel admin.
        </p>
      </div>
      <UserForm mode="create" />
    </div>
  )
}
