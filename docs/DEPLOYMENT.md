# Deployment Guide: CultureFirst

## Prerequisites
- GitHub repository
- Vercel account
- Supabase project

## Environment Variables (.env.local)
Create a `.env.local` file with the following variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
*Never commit this file to version control.*

## Deployment Steps
1.  **Supabase Configuration:**
    - Enable Email/Google Auth.
    - Run the SQL migration scripts in `supabase/migrations/`.
2.  **Vercel Configuration:**
    - Import the repository.
    - Set the environment variables in the Vercel project settings.
    - Ensure build command is `npm run build`.
    - Set Output Directory to `.next`.
3.  **Post-Deployment:**
    - Update `NEXT_PUBLIC_SITE_URL` to your production domain.
    - Configure OAuth callback URLs in Supabase and Vercel.

## Backup and Recovery
- Use Supabase's dashboard for data management.
- Regularly export CSV/JSON data from the `reviews` and `organizations` tables.
