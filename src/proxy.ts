import { NextResponse, type NextRequest } from "next/server";

/**
 * Lógica de protección de rutas de administración.
 * Consolidada en proxy.ts según las convenciones de este entorno de Next.js.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo protegemos las rutas que comienzan con /admin o /api/admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Excluir la página de login y la API de login para evitar bloqueos
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    // Verificar la cookie de sesión de admin (establecida en /admin/login)
    const adminSession = request.cookies.get("admin_session");

    // Si no hay sesión y es una ruta de página /admin, redirigir al login
    if (!adminSession && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      // Guardar la URL original para volver después del login
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Si no hay sesión y es una ruta de API /api/admin, devolver 401
    if (!adminSession && pathname.startsWith("/api/admin")) {
      return new NextResponse(
        JSON.stringify({ error: "No autorizado. Inicie sesión como administrador." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
