import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase-middleware'

const PROTECTED_PATHS = ['/dashboard', '/cook', '/account', '/setup', '/preacher']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh the Supabase session on every request so tokens don't expire
  const supabaseResponse = await updateSession(request)

  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  if (!isProtected) return supabaseResponse

  // Check auth for protected routes using the now-refreshed cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cook/:path*',
    '/account/:path*',
    '/setup/:path*',
    '/preacher/:path*',
    '/preacher',
  ],
}
