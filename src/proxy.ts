import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin route protection and Supabase session management.
 * Consolidated in proxy.ts as per this environment's conventions.
 */
export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl;

  // 1. Admin Protection (Pages and API)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Exclude login routes from protection
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return supabaseResponse;
    }

    // Check admin session cookie
    const adminSession = request.cookies.get("admin_session");

    // If no session and it's an admin page, redirect to login
    if (!adminSession && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // If no session and it's an admin API, return 401
    if (!adminSession && pathname.startsWith("/api/admin")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized. Please log in as administrator." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 2. User Auth Redirects (prevent logged in users from visiting login/register)
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
