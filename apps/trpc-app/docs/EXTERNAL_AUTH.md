# LootZone Authentication Integration

This document describes how to integrate your external Next.js application with LootZone's authentication system.

## Authentication Methods

LootZone supports two authentication methods:

1. **NextAuth Integration** - For internal app authentication (Discord + Credentials)
2. **JWT API Authentication** - For external app integration

## External App Integration

### Setup

1. Add the JWT_SECRET environment variable to your `.env` file:

```bash
JWT_SECRET="your-super-secret-jwt-key-here"
```

2. Your external app needs to make HTTP requests to the following API endpoints:

### API Endpoints

#### 1. User Registration

**POST** `/api/auth/register`

```typescript
// Request Body
{
  email: string;
  password: string;
  name?: string;
}

// Response (Success)
{
  success: true;
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  }
}

// Response (Error)
{
  error: string;
}
```

#### 2. User Login

**POST** `/api/auth/login`

```typescript
// Request Body
{
  email: string;
  password: string;
}

// Response (Success)
{
  success: true;
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  }
}

// Response (Error)
{
  error: string;
}
```

#### 3. Token Verification

**POST** `/api/auth/verify`

```typescript
// Request Body
{
  token: string;
}

// Response (Valid Token)
{
  valid: true;
  user: {
    id: string;
    email: string;
    role: string;
  }
}

// Response (Invalid Token)
{
  valid: false;
  error: string;
}
```

### Example Usage in External App

```typescript
// auth.service.ts
export class AuthService {
  private baseUrl = "http://localhost:3000"; // Your LootZone app URL

  async register(email: string, password: string, name?: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    return response.json();
  }

  async verifyToken(token: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return response.json();
  }
}
```

### Token Management

- JWT tokens are valid for 7 days
- Store the token securely in your external app (localStorage, sessionStorage, or httpOnly cookies)
- Always verify tokens before trusting user data
- Handle token expiration gracefully by redirecting to login

### Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Secure JWT Secret**: Use a strong, random JWT_SECRET
3. **Token Storage**: Store tokens securely in your external app
4. **CORS**: Configure CORS properly if needed
5. **Rate Limiting**: Implement rate limiting on authentication endpoints

### Error Handling

Common error responses:

- `400`: Bad request (missing fields, invalid format)
- `401`: Unauthorized (invalid credentials or token)
- `409`: Conflict (user already exists)
- `500`: Internal server error

### Integration Example

```typescript
// In your external Next.js app
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      verifyToken(token)
        .then((result) => {
          if (result.valid) {
            setUser(result.user);
          } else {
            localStorage.removeItem("accessToken");
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      localStorage.setItem("accessToken", result.token);
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return { user, loading, login, logout };
}
```

This integration allows your external app to authenticate users through LootZone while maintaining a secure, stateless authentication system.
