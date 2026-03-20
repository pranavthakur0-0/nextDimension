import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode, encodeTokens } from "@/lib/google";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }

  try {
    const tokens = await getTokensFromCode(code);
    const encoded = encodeTokens(tokens);

    const response = NextResponse.redirect(
      new URL("/?auth=success", request.url)
    );

    // Store tokens in an HTTP-only cookie
    response.cookies.set("google_tokens", encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Error exchanging code for tokens:", err);
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }
}
