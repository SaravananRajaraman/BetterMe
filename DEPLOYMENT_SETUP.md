# BetterMe Deployment Setup Guide

## Overview
This guide walks you through deploying BetterMe to Vercel and configuring Supabase.

## Table of Contents
1. [Supabase Project Setup](#supabase-project-setup)
2. [Enable Google OAuth](#enable-google-oauth)
3. [Push Notification Keys](#push-notification-keys)
4. [Local Testing](#local-testing)
5. [Vercel Deployment](#vercel-deployment)

---

## Supabase Project Setup

### Step 1: Create a New Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the form:
   - **Project name:** `betterme` (or your preferred name)
   - **Database password:** Create a strong password (save this!)
   - **Region:** Select the region closest to you
4. Wait 2-3 minutes for project creation to complete

### Step 2: Retrieve Your API Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy these values (you'll need them in Step 3):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** (under "Project API keys") → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Create the Database Schema

1. In Supabase dashboard, go to **SQL Editor** → **New Query**
2. Copy the entire contents of `supabase/schema.sql` from this project
3. Paste it into the Supabase SQL editor
4. Click **Run** (bottom right)
5. Wait for completion — you should see "Executed successfully"

The schema creates:
- `profiles` table (auto-created for new users via trigger)
- `categories` table (Health, Work, Personal, Learning auto-seeded)
- `todos` table
- `todo_completions` table
- `daily_reviews` table
- `push_subscriptions` table (for push notifications)
- RLS policies (row-level security for all tables)
- Auto-profile creation trigger

---

## Enable Google OAuth

### Step 1: Set Up Google OAuth in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. Keep this tab open — you'll paste credentials here in Step 3

### Step 2: Create OAuth Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project:
   - Click **Select a Project** (top left)
   - Click **New Project**
   - Name it `BetterMe` and click **Create**
3. Enable the Google+ API:
   - Search for **"Google+ API"** in the search bar
   - Click it and click **Enable**
4. Create OAuth 2.0 credentials:
   - Go to **Credentials** (left sidebar)
   - Click **Create Credentials** → **OAuth Client ID**
   - If prompted, click **Configure OAuth Consent Screen** first:
     - Choose **External**
     - Fill in app name: `BetterMe`
     - Add your email
     - Add scope: `openid`, `email`, `profile`
     - Click **Save & Continue** through all steps
   - Back to **Create OAuth Client ID**:
     - Choose **Web application**
     - Name: `BetterMe Web`
     - Under **Authorized JavaScript origins**, add:
       - `http://localhost:3000` (for local testing)
       - `https://<your-supabase-url>` (e.g., `https://abcdef123456.supabase.co`)
     - Under **Authorized redirect URIs**, add:
       - `http://localhost:3000/auth/callback`
       - `https://<your-supabase-url>/auth/v1/callback`
     - Click **Create**

5. Copy your **Client ID** and **Client Secret**

### Step 3: Paste into Supabase

Back in Supabase **Authentication** → **Providers** → **Google**:
- Paste **Client ID**
- Paste **Client Secret**
- Click **Save**

---

## Push Notification Keys (VAPID)

Push notifications require VAPID keys (public + private key pair).

### Generate VAPID Keys

Run this in your project directory:

```bash
npx web-push generate-vapid-keys
```

You'll see output like:
```
Public Key: BK5Z8...
Private Key: ABC123...
```

Save both values — you'll need them in the next section.

---

## Local Testing

### Step 1: Update `.env.local`

Create or update `d:\Projects\BetterMe\.env.local` with your real credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_EMAIL=mailto:your-email@example.com
```

### Step 2: Start Development Server

```bash
npm run dev -- --webpack
```

Your app should now be running at `http://localhost:3000`

### Step 3: Test the Flow

1. Navigate to `http://localhost:3000`
2. Click **Sign in with Google**
3. Complete Google OAuth login
4. You should land on the **Dashboard**
5. Check Supabase → **Table Editor** → **profiles** — your profile should be there with default categories created

---

## Vercel Deployment

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. Search for `BetterMe` repository
4. Click **Import**

### Step 2: Configure Environment Variables

In the Vercel import dialog, before clicking **Deploy**:

1. Click **Environment Variables**
2. Add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_EMAIL`

### Step 3: Override Build Command

In the **Build and Output Settings** section:
- **Build Command:** `next build --webpack`
- Leave **Output Directory** as `.next`

### Step 4: Deploy

Click **Deploy** and wait 2-3 minutes.

Once complete:
- You'll get a deployment URL (e.g., `https://betterme-abc123.vercel.app`)
- Copy this URL

### Step 5: Update Google OAuth

Since your Vercel domain is different from localhost:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **Credentials** → Your OAuth Client ID
3. Under **Authorized JavaScript origins**, add:
   - `https://betterme-abc123.vercel.app` (your actual Vercel URL)
4. Under **Authorized redirect URIs**, add:
   - `https://betterme-abc123.vercel.app/auth/callback`
5. Click **Save**

### Step 6: Update Supabase

1. Go to Supabase → **Authentication** → **Providers** → **Google**
2. No changes needed — Supabase allows any origin for OAuth callback

### Step 7: Test Deployed App

Open your Vercel deployment URL and test the full flow:
1. Click Sign in with Google
2. Complete login
3. Navigate Dashboard → Analytics → Settings
4. Create a todo and verify it saves

---

## Troubleshooting

### "Supabase URL and API key are required"
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure they're not wrapped in quotes
- Restart dev server with `npm run dev -- --webpack`

### "Google OAuth callback failed"
- Verify Google OAuth credentials in Supabase match Google Cloud Console
- Check that redirect URIs in Google Cloud Console include your domain
- Check Supabase allows the domain in **Authentication** → **URL Configuration**

### "Build failed on Vercel"
- Check you're using `next build --webpack` (not just `next build`)
- Verify all environment variables are set in Vercel dashboard
- Check build logs in Vercel → **Deployments** → View logs

---

## What's Next?

Once deployed:
- Share your app link with friends
- Monitor usage in Vercel Analytics
- Track errors in Vercel Logs
- Consider scaling if usage grows (Vercel Pro has higher limits)

Enjoy your habit tracker! 🚀
