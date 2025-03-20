import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
 
export default async function authMiddleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next();

}
 
export const config = {
	matcher: [
		/*
		 * Match all routes except for:
		 * 1. /sign-in, /sign-up (auth routes)
		 * 2. API routes (/api)
		 * 3. Static files (/_next, /favicon.ico, etc.)
		 */
		'/((?!api|_next|sign-in|sign-up|favicon.ico).*)',
	],
};