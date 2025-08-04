import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, message: "Token missing" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET || "your-secret-key";

    // Verify signature & expiration
    await jwtVerify(token, new TextEncoder().encode(secret));

    // If verification passes, decode payload for user info
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );

    const apiUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { valid: false, message: "API URL not configured" },
        { status: 500 }
      );
    }

    // Check if the session still exists by making a request to the main trpc app
    const sessionCheckResponse = await fetch(`${apiUrl}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const sessionCheck = await sessionCheckResponse.json();

    if (!sessionCheck.valid) {
      return NextResponse.json(
        { valid: false, message: "Session has been revoked" },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true, user: payload });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { valid: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
