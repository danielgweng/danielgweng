import { NextResponse } from "next/server";

export function middleware(request) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse("Admin is locked: set ADMIN_USER and ADMIN_PASSWORD env vars.", { status: 503 });
  }

  const auth = request.headers.get("authorization") || "";
  const expected = "Basic " + btoa(`${user}:${pass}`);

  if (auth === expected) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Regulars Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/export"],
};
