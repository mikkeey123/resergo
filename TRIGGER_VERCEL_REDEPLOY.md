# Trigger Vercel Redeploy - Quick Guide

Your changes have been pushed to GitHub, but they're not showing up on Vercel yet. Here's how to trigger a redeploy:

## Option 1: Manual Redeploy (Fastest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **ReserGo** project
3. Go to the **Deployments** tab
4. Find the latest deployment
5. Click the **three dots (⋯)** menu on the right
6. Click **Redeploy**
7. Wait for the deployment to complete (usually 1-3 minutes)

## Option 2: Push an Empty Commit (Triggers Auto-Deploy)

If Vercel is connected to GitHub and auto-deploy is enabled, you can trigger a redeploy by pushing an empty commit:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

## Option 3: Check Vercel Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Git**
4. Make sure:
   - ✅ **Production Branch** is set to `main`
   - ✅ **Auto-deploy** is enabled
   - ✅ GitHub integration is connected

## Option 4: Check Build Logs

If deployment is failing:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check the **Build Logs** for errors
4. Common issues:
   - Missing environment variables
   - Build errors
   - Dependency issues

## Verify Changes Are Deployed

After redeploying, check:
1. Hard refresh your Vercel site: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check the deployment URL
3. Test the add listing modal with different categories (Home, Experience, Service)

## Current Status

✅ All changes have been pushed to GitHub:
- Latest commit: `1fd76d3` - "Update add listing modal: show only rate, images, location, description for Services and Experiences"
- Branch: `main`
- Remote: `origin/main`

The changes should appear on Vercel after redeploying.

