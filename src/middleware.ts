import { unauthorized } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { success } from "zod/v4";

const SESSION_COOKIE_NAME = "uarc_admin_session";

const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

const PUBLIC_API_ROUTES = ["/api/admin/login", "/api/admin/logout"];

function isPublicRoute (pathname: string): boolean {
  return PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicApiRoute(pathname: string): boolean{
  return PUBLIC_API_ROUTES.some((route)=> pathname.startsWith(route))
}

function hasSession(request: NextRequest): boolean{
  return Boolean (
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );
}

export function middleware(request: NextRequest){
  const {pathname} = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if(isAdminPage && isPublicRoute (pathname)){
    return NextResponse.next();
  }

  if(isAdminApi && isPublicApiRoute (pathname)){
    return NextResponse.next();
  }

  if(isAdminPage){
    if(!hasSession(request)){
      const loginUrl = new URL ( "/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl)
    }
  }

  if(isAdminApi){
    if(!hasSession(request)){
    return NextResponse.json(
  {
    success: false,
    code: "UNAUTHORIZED",
    message: "Authentication required.",
  },
  {
    status: 401,
  }
);
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"], 
}