const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/** Build a human-readable error from an API response: surface the API's
 * `detail` message when there is one, never raw JSON or status lines. */
async function toApiError(res: Response): Promise<Error> {
  const fallback = `Erreur ${res.status} — réessayez plus tard`
  try {
    const body = await res.json()
    if (typeof body.detail === 'string') return new Error(body.detail)
    // FastAPI validation errors: detail is a list of {msg, loc, ...}
    if (Array.isArray(body.detail) && typeof body.detail[0]?.msg === 'string') {
      return new Error(body.detail[0].msg)
    }
  } catch {
    // body was not JSON — fall through to the generic message
  }
  return new Error(fallback)
}

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw await toApiError(res)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

/** Multipart upload — no JSON header so the browser sets the boundary. */
export async function upload<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', body: form })
  if (!res.ok) {
    throw await toApiError(res)
  }
  return res.json() as Promise<T>
}
