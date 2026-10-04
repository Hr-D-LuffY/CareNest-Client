// Runs once when the Next.js server starts. Importing the env module here validates every
// variable immediately, so a bad configuration fails at boot with a readable message.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./lib/env')
    await import('./lib/public-env')
  }
}
