import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";

  const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  url.searchParams.set("next", nextPath);

  const res = NextResponse.redirect(url);
  res.cookies.set({ name: "token", value: "", path: "/", maxAge: 0 });
  return res;
}

function redirectToApp(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/app";
  url.searchParams.set("error", "forbidden");
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return redirectToLogin(req);

  const secret = process.env.JWT_SECRET;
  if (!secret) return redirectToLogin(req);

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const role = typeof payload.role === "string" ? payload.role : "";
    const path = req.nextUrl.pathname;

    const teacherOnly =
      path.startsWith("/app/projects") || path.startsWith("/app/tasks");
    if (teacherOnly && role !== "TEACHER" && role !== "ADMIN") {
      return redirectToApp(req);
    }

    const adminOnly =
      path.startsWith("/app/users") || path.startsWith("/users");
    if (adminOnly && role !== "ADMIN") {
      return redirectToApp(req);
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/users/:path*"],
};
