// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session/edge";
import { sessionOptions } from "./lib/AuthSession/Config";

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);

  const { user } = session;

  if (!user?.isLoggedIn || !user.id) {
    if (user?.id || user?.isLoggedIn) session.destroy();

    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return res;
};

export const config = {
  matcher: "/admin",
};
