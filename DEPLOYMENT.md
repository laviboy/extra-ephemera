# Deployment Guide - Railway

## Prerequisites

- [ ] GitHub account with repository pushed
- [ ] Railway account ([railway.app](https://railway.app))
- [ ] Supabase project created ([supabase.com](https://supabase.com))

## Step 1: Prepare Your Supabase Project

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy these values (you'll need them for Railway):
   - Project URL (`PUBLIC_SUPABASE_URL`)
   - Anon/Public Key (`PUBLIC_SUPABASE_ANON_KEY`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

4. Navigate to **Settings** → **Database**
5. Copy the Connection String URI (`DATABASE_URL`)

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `extra-ephemera` repository
5. Railway will automatically detect it's a Node.js project

## Step 3: Configure Environment Variables

In your Railway project dashboard:

1. Click on your service
2. Go to **"Variables"** tab
3. Add these environment variables:

```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## Step 4: Configure Build Settings (Optional)

Railway should auto-detect these, but you can verify:

- **Build Command**: `npm run build`
- **Start Command**: `npm start` (or `node ./dist/server/entry.mjs`)

## Step 5: Configure Supabase Authentication

After Railway gives you a public URL (e.g., `https://your-app.up.railway.app`):

1. Go back to Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Railway URL to:
   - **Site URL**: `https://your-app.up.railway.app`
   - **Redirect URLs**: Add `https://your-app.up.railway.app/**`

## Step 6: Deploy!

1. Railway will automatically build and deploy your app
2. You'll get a public URL you can share
3. Anyone can access and test the app at that URL

## Testing After Deployment

- [ ] Visit your Railway URL
- [ ] Test authentication (sign up/sign in)
- [ ] Test creating a listing
- [ ] Verify profile page shows user listings
- [ ] Check all pages load correctly

## Troubleshooting

### Build Fails
- Check Railway logs in the **Deployments** tab
- Verify all dependencies are in `package.json`

### Authentication Not Working
- Verify Supabase environment variables are correct
- Check that Railway URL is added to Supabase Redirect URLs
- Make sure keys are not wrapped in quotes in Railway variables

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase database is running
- Run `npm run db:push` locally first to ensure schema is up to date

## Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual Supabase values in `.env`

3. Run locally:
   ```bash
   npm run dev
   ```

## Continuous Deployment

Railway automatically redeploys when you push to your GitHub repository's main/master branch.

```bash
git add .
git commit -m "Your changes"
git push origin master
```

Railway will detect the push and redeploy automatically!
