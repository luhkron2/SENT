# 🔑 MASTER PASSWORD ACCESS

## Master Password
**Password:** `KRON@04`

## How It Works

The master password `KRON@04` provides **ADMIN-level access** to ANY account in the system.

### Usage

1. Go to the login page: http://localhost:3000/login
2. **Leave the email field EMPTY** (or enter anything)
3. Enter password: `KRON@04`
4. Click Login
5. You will be logged in as ADMIN with full access

**SIMPLE VERSION:** Just type `KRON@04` in the password field and hit login!

### Features

✅ **Bypasses All Authentication** - No need to know actual passwords
✅ **Always Grants ADMIN Role** - Full system access regardless of user's actual role
✅ **Works with Any Username** - Even non-existent accounts
✅ **Instant Access** - No password hashing check needed
✅ **Access All Levels:**
   - Admin Dashboard
   - Operations Panel
   - Workshop Management
   - Schedule Management
   - All Reports & Analytics

### Security Note

⚠️ **FOR DEVELOPMENT USE ONLY**
- Remove this before production deployment
- Keep this password confidential
- Do not commit this to public repositories

### Examples

**Login as existing user with admin override:**
- Username: `john@example.com`
- Password: `KRON@04`
- Result: Logged in as Admin (overrides John's actual role)

**Login with non-existent user:**
- Username: `anything@anywhere.com`
- Password: `KRON@04`
- Result: Logged in as "Master Admin" with full access

## Implementation Location
File: `auth.ts` (lines 25-57)

## To Remove Master Password
Delete the master password check block in `auth.ts` before deploying to production.
