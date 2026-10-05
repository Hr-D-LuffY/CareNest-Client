import { getRoleLabel } from '@/lib/auth/role-label'
import { getSession } from '@/lib/auth/session'

// Temporary landing page so the shell can be opened after login. The real overview replaces it
// in its own commit.
export default async function AreaHomePage() {
  const session = await getSession()
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl md:text-3xl">Welcome{session ? `, ${session.name}` : ''}</h1>
      {session && <p className="text-muted-foreground">Signed in as {getRoleLabel(session)}.</p>}
    </div>
  )
}
