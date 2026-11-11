import { NextResponse } from 'next/server'
import {
  createPreviewCookieValue,
  previewCookieOptions,
  STORE_PREVIEW_COOKIE,
  verifyPreviewToken,
} from '@/lib/storeLaunch'

export async function middleware(request) {
  const preview = request.nextUrl.searchParams.get('preview')
  if (!preview || !verifyPreviewToken(preview)) {
    return NextResponse.next()
  }

  const secret = process.env.STORE_PREVIEW_TOKEN
  const cookieValue = await createPreviewCookieValue(secret)
  if (!cookieValue) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.searchParams.delete('preview')
  const response = NextResponse.redirect(url)
  response.cookies.set(STORE_PREVIEW_COOKIE, cookieValue, previewCookieOptions())
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icon\\.svg|studio).*)'],
}
