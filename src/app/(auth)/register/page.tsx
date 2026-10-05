import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/auth-card'
import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Create a CareNest guardian account to book childcare, request rides and pay by wallet.',
}

type RegisterPageProps = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect } = await searchParams

  return (
    <AuthCard mode="register" redirect={redirect}>
      <RegisterForm redirect={redirect} />
    </AuthCard>
  )
}
