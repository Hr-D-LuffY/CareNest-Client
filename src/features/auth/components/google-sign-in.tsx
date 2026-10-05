'use client'

import { type CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { useGoogleLoginMutation } from '../auth.queries'

type GoogleSignInProps = {
  clientId: string
  redirect: string | undefined
  // The account is new, so the backend needs a phone number. The page asks for it, then retries.
  onNeedsPhone: (idToken: string) => void
}

// Google's multicolour "G". Fixed brand colours, as Google's branding rules require.
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-[18px]">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

// A button styled like the rest of the page, with Google's real sign-in button laid invisibly on
// top of it. Google only hands out a trusted ID token through its own button (it lives in an
// iframe that cannot be styled), so a click lands on that one while the page shows our design.
// The backend then checks the token with Google.
export function GoogleSignIn({ clientId, redirect, onNeedsPhone }: GoogleSignInProps) {
  const google = useGoogleLoginMutation(redirect)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  // Google draws its button at a fixed pixel width (max 400), so measure the space we have.
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const measure = () => setWidth(Math.min(400, Math.floor(element.clientWidth)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  function handleSuccess({ credential }: CredentialResponse) {
    if (!credential) {
      toast.error('Google sign-in did not complete. Please try again.')
      return
    }
    google.mutate(
      { idToken: credential },
      {
        onError: (error) => {
          if (isApiError(error) && error.fieldErrors.phone) onNeedsPhone(credential)
          else toast.error(getErrorMessage(error))
        },
      },
    )
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div ref={containerRef} className="h-11" aria-busy={google.isPending}>
        {google.isPending ? (
          <output className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Signing you in…
          </output>
        ) : (
          <div className="group relative h-full">
            {/* What the user sees. Not focusable: the invisible Google button above it is the control. */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() =>
                toast.message('Google sign-in is still loading. Please try again in a moment.')
              }
              className="flex h-full w-full items-center justify-center gap-3 rounded-lg border bg-background text-sm font-medium text-foreground transition-colors group-hover:bg-accent group-focus-within:ring-3 group-focus-within:ring-ring/50"
            >
              <GoogleLogo />
              Continue with Google
            </button>

            {/* Google's real button: 40px tall, stretched to the 44px of ours. */}
            {width > 0 && (
              <div className="absolute inset-x-0 top-0 h-10 origin-top scale-y-110 overflow-hidden opacity-[0.01]">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => toast.error('Google sign-in did not complete. Please try again.')}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  width={width}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  )
}
