import { decodeJwt, JWTPayload, jwtVerify, SignJWT } from "jose";

const isValidToken = (accessToken: string) => {
  console.log("🔍 [JWT_UTILS] Checking if token is valid:", accessToken ? `${accessToken.substring(0, 20)}...` : "undefined");

  if (!accessToken) {
    console.log("🔍 [JWT_UTILS] No token provided, returning false");
    return false;
  }

  try {
    const decoded = decodeJwt(accessToken);
    const currentTime = Date.now() / 1000;
    const isValid = decoded.exp !== undefined && decoded.exp > currentTime;

    console.log("🔍 [JWT_UTILS] Token decoded:", { exp: decoded.exp, currentTime, isValid });
    return isValid;
  } catch (error) {
    console.error("❌ [JWT_UTILS] Error decoding token:", error);
    return false;
  }
};

const setSession = (accessToken: string | null) => {
  console.log("🔍 [JWT_UTILS] Setting session with token:", accessToken ? `${accessToken.substring(0, 20)}...` : "null");

  // Only run on client side to avoid hydration mismatches
  if (typeof window === 'undefined') {
    console.log("🔍 [JWT_UTILS] Running on server side, skipping session set");
    return;
  }

  if (accessToken) {
    console.log("🔍 [JWT_UTILS] Storing token in localStorage and cookies...");
    localStorage.setItem("accessToken", accessToken);

    // Also set in cookies for middleware compatibility (Secure flag only on HTTPS)
    const baseCookie = [
      `accessToken=${accessToken}`,
      "path=/",
      `max-age=${7 * 24 * 60 * 60}`,
    ];

    // In development, use lax instead of strict for better compatibility
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      baseCookie.push("samesite=lax");
    } else {
      baseCookie.push("samesite=strict");
    }

    if (window.location.protocol === "https:") {
      baseCookie.push("secure");
    }

    const cookieString = baseCookie.join("; ");
    console.log("🔍 [JWT_UTILS] Setting cookie with string:", cookieString);
    document.cookie = cookieString;

    // Test if cookie was set correctly
    setTimeout(() => {
      const testCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="));
      console.log("🔍 [JWT_UTILS] Cookie test after setting:", testCookie ? "found" : "not found");
      console.log("🔍 [JWT_UTILS] All cookies after setting:", document.cookie);
    }, 100);
  } else {
    console.log("🔍 [JWT_UTILS] Removing token from localStorage and cookies...");
    localStorage.removeItem("accessToken");
    // Remove from cookies as well
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    console.log("🔍 [JWT_UTILS] Token removed from storage");
  }
};

const verify = async (token: string, secret: string) => {
  console.log("🔍 [JWT_UTILS] Verifying token with secret");
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret) // Secret needs to be Uint8Array
    );
    console.log("🔍 [JWT_UTILS] Token verification successful");
    return payload;
  } catch (error) {
    console.error("❌ [JWT_UTILS] Token verification failed:", error);
    return null;
  }
};

const sign = async (
  payload: JWTPayload,
  secret: string,
  options: {
    expiresIn?: string;
  } = {}
) => {
  console.log("🔍 [JWT_UTILS] Signing new token with payload:", payload);
  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(options.expiresIn || "1h")
      .setIssuedAt()
      .sign(new TextEncoder().encode(secret));
    console.log("🔍 [JWT_UTILS] Token signed successfully");
    return jwt;
  } catch (error) {
    console.error("❌ [JWT_UTILS] Error signing token:", error);
    return null;
  }
};

export { isValidToken, setSession, sign, verify };
