import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * All paths except static assets and images — the session must be
     * refreshed on every real page/API request.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|fpc-crest.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
