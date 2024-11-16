import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";
 
export default async function authMiddleware(request: NextRequest) {
	const response = await fetch(
		`${process.env.BETTER_AUTH_URL}/api/auth/get-session`,
		{
			headers: {
				//get the cookie from the request
				cookie: request.headers.get("cookie") || "",
			},
		},
	);
    
    const session: Session | null = await response.json();

    if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	return NextResponse.next();
}
 
export const config = {
	matcher: ["/"],
};