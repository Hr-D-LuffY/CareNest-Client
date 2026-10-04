// Standard backend envelope: { success, message, data, meta? } or { success: false, message, errors }.

export type PaginationMeta = {
  page: number
  limit: number
  total: number
}

export type ApiSuccess<T> = {
  success: true
  message: string
  data: T
  meta?: PaginationMeta
}

export type ApiFieldError = {
  path: string
  message: string
}

export type ApiFailure = {
  success: false
  message: string
  errors: ApiFieldError[]
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

// What the fetch wrappers return for list endpoints, once the envelope is unwrapped.
export type Paginated<T> = {
  items: T[]
  meta: PaginationMeta
}

// Query params every list endpoint accepts (?page=&limit=).
export type PaginationParams = {
  page?: number
  limit?: number
}
