import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/scripts',
  '/ai/analysis',
  '/ai/script-analysis',
  '/ai/real-time'
]

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Verificar si la ruta actual requiere autenticación
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isApiRoute = path.startsWith('/api/')
  
  // Si es una ruta protegida, verificar la sesión
  if (isProtectedRoute || isApiRoute) {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Si no hay sesión y es una ruta protegida, redirigir al login
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('returnUrl', path)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Si es una ruta de API y no hay sesión, devolver error 401
    if (!session && isApiRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return res
}

// Configurar el middleware para que se ejecute en rutas específicas
export const config = {
  matcher: [
    // Proteger todas las rutas de dashboard y funcionalidades
    '/dashboard/:path*', 
    '/scripts/:path*',
    '/ai/:path*',
    // Proteger API routes
    '/api/:path*',
    // Excluir archivos estáticos y favicons
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}