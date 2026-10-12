# CultureFirst Vercel Deployment - Manual Steps (5 minutes)

## 🚀 Execute These Commands in Order

### Step 1: Push to GitHub

```bash
cd "D:\Culture First App\culturefirst"
git remote add origin https://github.com/rafisamnan-ael/culturefirst.git
git branch -M main
git push -u origin main
```

When prompted, authenticate with GitHub (use your browser or personal access token)

---

### Step 2: Manual Steps in Browser (3 minutes)

#### 2a. Go to Vercel Dashboard
- Open: https://vercel.com/dashboard
- Click **"Add New"** → **"Project"**
- Click **"Import Git Repository"**
- Search for `culturefirst` and select it
- Click **"Import"**

#### 2b. Add Environment Variables

In the Vercel Import screen, scroll to **"Environment Variables"** section and add these:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Get from: Supabase Dashboard → Settings → API (copy Project URL) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Get from: Supabase Dashboard → Settings → API (copy "anon public" key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Get from: Supabase Dashboard → Settings → API (copy "service_role secret" key) |
| `NEXT_PUBLIC_SITE_URL` | `https://culturefirst.vercel.app` |
| `DATA_SOURCE` | `supabase` |
| `DEV_AUTH` | `false` |

#### 2c. Deploy
- Click **"Deploy"** button
- Wait 2-3 minutes for deployment to complete

#### 2d. Get Your Live URL
- Vercel will show: `https://culturefirst-[random].vercel.app`
- Or use: `https://culturefirst.vercel.app` (Vercel's suggested domain)

---

### Step 3: Configure Supabase Auth Callback

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Authentication** → **URL Configuration**
4. Add this Redirect URL:
   ```
   https://culturefirst.vercel.app/auth/callback
   ```
   (Replace with your actual Vercel URL if different)
5. Click **"Save"**

---

### Step 4: Test Your Live Site

Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ Can search organizations
- ✅ Can view organization profile
- ✅ Can navigate to review form
- ✅ Can sign up/login

---

## ⏱️ Total Time: ~10-15 minutes

**Your app will then be live and publicly accessible!**
