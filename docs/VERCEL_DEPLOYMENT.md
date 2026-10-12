# CultureFirst Vercel Deployment Guide

## Quick Start (5-10 minutes)

### Step 1: Initialize Git Repository Locally

```bash
cd D:\Culture\ First\ App\culturefirst
git init
git add .
git commit -m "Initial commit: CultureFirst MVP - organizational culture review platform"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `culturefirst` (or your preferred name)
3. **Description:** "CultureFirst - Organizational culture review platform for Bangladesh"
4. **Public** (recommended for SEO and public access)
5. **Skip** initializing with README/license (we have them)
6. Click **Create repository**

### Step 3: Push to GitHub

```bash
cd D:\Culture\ First\ App\culturefirst
git remote add origin https://github.com/YOUR_USERNAME/culturefirst.git
git branch -M main
git push -u origin main
```

(Replace `YOUR_USERNAME` with your actual GitHub username)

### Step 4: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**
4. Search for `culturefirst` (should appear if it's public or you own it)
5. Click **Import**

### Step 5: Configure Environment Variables

On the Vercel deployment screen, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your_supabase_anon_key>
NEXT_PUBLIC_SITE_URL=https://culturefirst.vercel.app
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
DATA_SOURCE=supabase
DEV_AUTH=false
SCORE_MIN_ANSWERED_PARAMETERS=3
SCORE_MIN_WEIGHT_COVERAGE=0.6
AGG_MIN_PROVISIONAL=5
AGG_MIN_PUBLISHED=20
```

**Where to get these values:**
- Go to your Supabase project: https://supabase.com/dashboard/projects
- Click your project
- Settings → API
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (keep this private!)

### Step 6: Deploy

1. Click **"Deploy"** on Vercel
2. Wait for build to complete (2-3 minutes)
3. Once deployed, you'll see:
   - **Production URL:** `https://culturefirst.vercel.app`
   - **Deployments** tab with build logs

### Step 7: Configure Supabase Auth Redirect

In Supabase:
1. Go to Project → Authentication → URL Configuration
2. Add this Redirect URL:
   ```
   https://culturefirst.vercel.app/auth/callback
   ```
3. Save

### Step 8: Test the Live Site

1. Go to https://culturefirst.vercel.app
2. You should see the homepage
3. Try:
   - Browse organizations
   - View a category page
   - Sign up/login (should redirect to auth)
   - View admin panel

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (public) | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (server-only) | `eyJhbGc...` |
| `NEXT_PUBLIC_SITE_URL` | Your deployment URL | `https://culturefirst.vercel.app` |
| `DATA_SOURCE` | Use Supabase or fixtures | `supabase` |
| `DEV_AUTH` | Allow dev auth (disable in prod) | `false` |
| `SCORE_MIN_ANSWERED_PARAMETERS` | Min rated parameters | `3` |
| `SCORE_MIN_WEIGHT_COVERAGE` | Min weight coverage % | `0.6` |
| `AGG_MIN_PROVISIONAL` | Min reviews for provisional | `5` |
| `AGG_MIN_PUBLISHED` | Min reviews for published | `20` |

---

## Troubleshooting

### Build Fails
- Check Vercel build logs (Deployments tab)
- Common issues:
  - Missing environment variables
  - Incorrect Supabase keys
  - TypeScript errors

### Auth Not Working
- Verify Supabase redirect URL is correct
- Check browser console for OAuth errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct

### Blank Homepage
- Check if store is returning data (dev console)
- Verify `DATA_SOURCE=supabase` is set
- Check Supabase connection

### 500 Errors
- Check Vercel function logs
- Verify Supabase service-role key is correct
- Check database RLS policies

---

## Post-Deployment Checklist

- [ ] Homepage loads
- [ ] Can search organizations
- [ ] Can view organization profile
- [ ] Can navigate to review form
- [ ] Can sign up
- [ ] Can login with OAuth
- [ ] Admin panel is accessible
- [ ] No console errors
- [ ] Mobile layout responsive

---

## Custom Domain (Optional)

To use a custom domain (e.g., `culturefirst.bd`):

1. In Vercel project: **Settings** → **Domains**
2. Enter your domain: `culturefirst.bd`
3. Add DNS records (Vercel will show you the exact records)
4. Wait for DNS propagation (5-30 minutes)
5. Update Supabase redirect URL to use custom domain

---

## Rollback

If deployment has issues:
1. Go to Vercel Deployments tab
2. Find previous successful deployment
3. Click **"Promote to Production"**

---

## Monitoring

After deployment:
1. **Vercel Analytics:** https://vercel.com/dashboard → Project → Analytics
2. **Error Tracking:** Check Vercel Function Logs for 500 errors
3. **Supabase Logs:** https://supabase.com/dashboard → Logs

---

## Need Help?

If you get stuck:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify all environment variables
4. Test locally with `npm run dev` first

**Estimated total time:** 10-15 minutes
