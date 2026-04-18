# Vercel Deployment Checklist

This file tracks what needs to be configured in Vercel dashboard.

## Pre-Deployment (You Should Do Now)

- [x] GitHub repository pushed to `main` branch
- [x] `.env.local` configured locally with real credentials
- [x] Local dev server runs without errors (`npm run dev -- --webpack`)
- [x] Database schema applied in Supabase
- [x] VAPID keys generated and saved

## Vercel Dashboard Configuration

When you import the project to Vercel, set these:

### Build & Output
- **Build Command:** `next build --webpack`
- **Output Directory:** `.next`
- **Root Directory:** `/` (default)

### Environment Variables (Copy from `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL = https://flgmhsgxijuhaiawqmtz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BIShWYBaAfPVWoqM98DZ1N0OB12qdm5v...
VAPID_PRIVATE_KEY = LWCM-MmzIz62puC8y_vXc9gOUa1WE9yQhvz-9_k2TZs
VAPID_EMAIL = mailto:rsaravanan.btech@gmail.com
```

### Git Settings
- **Framework:** Next.js (should auto-detect)
- **Root Directory:** `.` (default)

## Post-Deployment

After Vercel completes first deployment:

1. Copy your Vercel deployment URL (e.g., `https://betterme-abc123.vercel.app`)
2. Update Google OAuth settings in Google Cloud Console:
   - Add Vercel URL to "Authorized JavaScript origins"
   - Add `{vercel-url}/auth/callback` to "Authorized redirect URIs"
3. Test the deployed app

## Troubleshooting Vercel Deployment

If build fails:
- Check build logs in Vercel dashboard (Deployments → View logs)
- Verify `next build --webpack` command is set
- Verify all env vars are in dashboard (no quotes)
- Check for missing dependencies with `npm ci`

If app crashes on Vercel:
- Check Vercel Function logs (Deployments → Runtime logs)
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase has correct OAuth settings for Vercel domain
