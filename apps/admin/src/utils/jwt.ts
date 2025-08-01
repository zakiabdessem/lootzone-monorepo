import { decodeJwt, JWTPayload, jwtVerify, SignJWT } from "jose";

const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = decodeJwt(accessToken);
  const currentTime = Date.now() / 1000;

  return decoded.exp !== undefined && decoded.exp > currentTime;
};

const setSession = (accessToken: string | null) => {
  // Only run on client side to avoid hydration mismatches
  if (typeof window === 'undefined') return;

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    // Also set in cookies for middleware compatibility (Secure flag only on HTTPS)
    const baseCookie = [
      `accessToken=${accessToken}`,
      "path=/",
      `max-age=${7 * 24 * 60 * 60}`,
      "samesite=strict",
    ];
    if (window.location.protocol === "https:") {
      baseCookie.push("secure");
    }
    document.cookie = baseCookie.join("; ");
  } else {
    localStorage.removeItem("accessToken");
    // Remove from cookies as well
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

const verify = async (token: string, secret: string) => {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret) // Secret needs to be Uint8Array
    );
    return payload;
  } catch (error) {
    console.error("Invalid token:", error);
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
  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(options.expiresIn || "1h")
      .setIssuedAt()
      .sign(new TextEncoder().encode(secret));
    return jwt;
  } catch (error) {
    console.error("Error signing token:", error);
    return null;
  }
};

export { isValidToken, setSession, sign, verify };
