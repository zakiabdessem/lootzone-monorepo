import { NextRequest, NextResponse } from "next/server";
import { authService } from "../../../services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, message: "Session has been revoked" },
        { status: 401 }
      );
    }

    const result = await authService.verifyToken(token);

    if (!result.valid) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { valid: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}