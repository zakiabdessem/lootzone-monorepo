# Coupon Admin Authorization Debug Guide

## The Issue

You're getting `UNAUTHORIZED` errors when accessing coupon endpoints from the admin panel.

## Root Cause

The `adminProcedure` requires:
1. A valid JWT token in the `Authorization` header
2. The user's role must be `"admin"` (from UserRole.ADMIN enum)

## How to Fix

### Option 1: Check Your JWT Token (Recommended)

1. **Verify JWT_SECRET is set:**
   ```bash
   # In apps/trpc-app/.env
   JWT_SECRET=your-secret-key-here
   
   # Make sure it matches the admin app's secret
   ```

2. **Check the JWT payload includes role:**
   - Open browser DevTools → Application → Local Storage
   - Find `accessToken`
   - Decode it at https://jwt.io
   - Verify it contains: `{ "role": "admin", ... }`

3. **Ensure you're logged in as admin:**
   - Check your user in the database
   - Verify the `role` column is set to `"admin"`

### Option 2: Temporary Public Access (FOR TESTING ONLY)

If you just want to test the coupon functionality quickly, temporarily make the endpoints public:

**In `/home/zak/lootzone-monorepo/apps/trpc-app/src/server/api/routers/coupon.ts`:**

Replace all `adminProcedure` with `publicProcedure` (lines 193, 252, 298, 364, 441, 480)

⚠️ **WARNING:** This removes all security! Change it back after testing!

### Option 3: Check Database User Role

```sql
-- Connect to your database and run:
SELECT id, email, role FROM "User" WHERE email = 'your-admin-email@example.com';

-- If role is not 'admin', update it:
UPDATE "User" SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

## Quick Test

To verify the JWT is working:

1. Open browser console on admin panel
2. Run:
   ```javascript
   console.log(localStorage.getItem('accessToken'));
   ```
3. Copy the token
4. Decode at jwt.io
5. Check if `role: "admin"` exists in the payload

## Expected JWT Payload

```json
{
  "sub": "user-id-here",
  "id": "user-id-here",
  "email": "admin@example.com",
  "role": "admin",  // ← This must be "admin"
  "iat": 1234567890,
  "exp": 1234567890
}
```

## If Still Not Working

Add debug logging to see what's received:

1. Edit `apps/trpc-app/src/server/api/trpc.ts` line 172-178
2. Add console.log:
   ```typescript
   .use(({ ctx, next }) => {
     const user = ctx.session?.user || ctx.customUser;
     
     console.log('[ADMIN DEBUG] User:', user);
     console.log('[ADMIN DEBUG] Role:', user?.role);
     
     if (!user) {
       throw new TRPCError({ code: "UNAUTHORIZED" });
     }
     // ... rest of code
   })
   ```

3. Check server logs when making requests

