const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string>
  body?: unknown
}

/**
 * Generic fetch wrapper tương thích với Vue Query
 * Tự động xử lý JSON parse, error handling, query params
 */
export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, body, headers: customHeaders, ...restOptions } = options

  // Xây dựng URL với query params
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  // Xây dựng headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  // Thực hiện fetch
  const response = await fetch(url.toString(), {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Xử lý lỗi
  if (!response.ok) {
    let errorMessage = response.statusText
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // Không parse được JSON, dùng statusText
    }
    throw new ApiError(response.status, response.statusText, errorMessage)
  }

  // Xử lý response rỗng (204 No Content)
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// Shorthand methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>, headers?: Record<string, string>) =>
    apiFetch<T>(endpoint, { method: 'GET', params, headers }),

  post: <T>(endpoint: string, body?: unknown) => apiFetch<T>(endpoint, { method: 'POST', body }),

  patch: <T>(endpoint: string, body?: unknown) => apiFetch<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
}
