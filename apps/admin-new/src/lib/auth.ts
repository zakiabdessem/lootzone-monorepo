export const ACCESS_TOKEN_KEY = "accessToken";

export const isValidToken = (token: string): boolean => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export const setSession = (token: string | null) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    
    // Set cookie with proper options
    const cookieOptions = [
      `path=/`,
      `max-age=${7 * 24 * 60 * 60}`, // 7 days
      window.location.protocol === "https:" ? "secure" : "",
      window.location.hostname.includes("localhost")
        ? "samesite=lax"
        : "samesite=strict"
    ].filter(Boolean).join("; ");

    document.cookie = `${ACCESS_TOKEN_KEY}=${token}; ${cookieOptions}`;
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    document.cookie
      .split("; ")
      .find(row => row.startsWith(`${ACCESS_TOKEN_KEY}=`))
      ?.split("=")[1] ||
    null
  );
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};
