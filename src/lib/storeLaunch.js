export const DEFAULT_LAUNCH_AT = '2026-11-14T05:00:00Z'
export const STORE_PREVIEW_COOKIE = 'jp_store_preview'

export function getLaunchAtIso() {
  const fromEnv = process.env.STORE_LAUNCH_AT?.trim()
  return fromEnv || DEFAULT_LAUNCH_AT
}

export function getLaunchAtMs() {
  const ms = Date.parse(getLaunchAtIso())
  return Number.isFinite(ms) ? ms : Date.parse(DEFAULT_LAUNCH_AT)
}

export function isLaunchTimeReached(now = Date.now()) {
  return now >= getLaunchAtMs()
}

function constantTimeEqualStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export function verifyPreviewToken(candidate) {
  const expected = process.env.STORE_PREVIEW_TOKEN
  if (!expected?.length || typeof candidate !== 'string' || !candidate.length) {
    return false
  }
  return constantTimeEqualStrings(candidate, expected)
}

function previewCookieValue(source) {
  if (!source) return null
  const entry = source.get?.(STORE_PREVIEW_COOKIE)
  if (!entry) return null
  if (typeof entry === 'string') return entry
  return entry.value ?? null
}

/**
 * @param {Request | import('next/dist/compiled/@edge-runtime/cookies').ReadonlyRequestCookies} request
 */
export function isStoreOpen(request) {
  if (isLaunchTimeReached()) return true
  if (!process.env.STORE_PREVIEW_TOKEN?.length) return false
  const cookieSource =
    request?.cookies && typeof request.cookies.get === 'function'
      ? request.cookies
      : request
  return previewCookieValue(cookieSource) === '1'
}

export function previewCookieOptions() {
  const secure = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  }
}
