
<old_str>import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, message: "Token missing" },
        { status: 400 }
      );
    }

    // Make tRPC call to the main app using the correct port
    const trpcUrl = "http://0.0.0.0:5000/api/trpc/session.verifyToken";
    const response = await fetch(trpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: { token },
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.result?.data?.valid) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ valid: true, user: data.result.data.user });
  } catch (err) {
    return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
  }
}</old_str>
<new_str>import { NextRequest, NextResponse } from "next/server";
import { authService } from "../../../services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, message: "Token missing" },
        { status: 400 }
      );
    }

    const result = await authService.verifyToken(token);
    
    if (!result.valid) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
  }
}</new_str>
