import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/auth-card'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your CareNest password.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard mode="forgot-password">
      <ForgotPasswordForm />
    </AuthCard>
  )
}
