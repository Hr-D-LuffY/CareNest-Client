import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/auth-card'
import { LoginForm } from '@/features/auth/components/login-form'
import { getAvailableDemoRoles } from '@/lib/auth/demo-credentials'
import { publicEnv } from '@/lib/public-env'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to CareNest to book childcare, track rides and manage your wallet.',
}

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams

  return (
    <AuthCard mode="login" redirect={redirect}>
      <LoginForm
        redirect={redirect}
        demoRoles={getAvailableDemoRoles()}
        googleClientId={publicEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      />
    </AuthCard>
  )
}
