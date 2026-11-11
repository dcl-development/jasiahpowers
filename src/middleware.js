import { NextResponse } from 'next/server'
import {
  previewCookieOptions,
  STORE_PREVIEW_COOKIE,
  verifyPreviewToken,
} from '@/lib/storeLaunch'

export function middleware(request) {
  const preview = request.nextUrl.searchParams.get('preview')
  if (!preview || !verifyPreviewToken(preview)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.searchParams.delete('preview')
  const response = NextResponse.redirect(url)
  response.cookies.set(STORE_PREVIEW_COOKIE, '1', previewCookieOptions())
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icon\\.svg|studio).*)'],
}
