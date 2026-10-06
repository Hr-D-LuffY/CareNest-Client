import { jsonFromError, jsonSuccess } from '@/lib/api/respond'
import { backendRootApi } from '@/lib/api/server'

// A cold Render instance can take about a minute to answer, so allow the full minute here.
export const maxDuration = 60

// GET /api/backend-health
// Pings the backend's public /health and answers only once it has replied. The landing page's
// "Activate Backend" button uses it to wake the free-tier server before a demo.
export async function GET() {
  try {
    await backendRootApi.get('/health')
    return jsonSuccess('Backend is awake', null)
  } catch (error) {
    return jsonFromError(error)
  }
}
