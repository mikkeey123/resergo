# Fix Firebase Unauthorized Domain Error

## Problem
You're seeing the error: `Firebase: Error (auth/unauthorized-domain)`

This happens when your Vercel deployment domain (`resergo.vercel.app`) is not authorized in Firebase Console.

## Solution: Add Authorized Domains in Firebase

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **rgdatabase-10798**

### Step 2: Navigate to Authentication Settings
1. Click on **Authentication** in the left sidebar
2. Click on the **Settings** tab (gear icon)
3. Scroll down to **Authorized domains**

### Step 3: Add Your Vercel Domain
1. Click **Add domain**
2. Enter: `resergo.vercel.app`
3. Click **Add**

### Step 4: Add Additional Domains (if needed)
Also add these domains if you plan to use them:
- `localhost` (should already be there for development)
- `*.vercel.app` (if you want to allow all Vercel preview deployments)
- Your custom domain (if you have one)

### Step 5: Wait for Changes to Propagate
- Changes usually take effect immediately, but can take up to 5 minutes
- Refresh your Vercel deployment and try logging in again

## Current Authorized Domains
By default, Firebase includes:
- `localhost`
- Your Firebase project domain (e.g., `rgdatabase-10798.firebaseapp.com`)

## Important Notes
- Each domain must be added separately
- Wildcard domains (like `*.vercel.app`) are supported
- Make sure you're adding the exact domain shown in your browser's address bar
- If you have a custom domain, add both the custom domain and the Vercel domain

## Verification
After adding the domain:
1. Wait 1-2 minutes for changes to propagate
2. Refresh your Vercel deployment
3. Try logging in again
4. The error should be resolved

## Alternative: Check Firebase Config
If the issue persists, verify your Firebase configuration in `Config.js`:
- Make sure `authDomain` is set correctly
- Check that environment variables are properly set in Vercel

