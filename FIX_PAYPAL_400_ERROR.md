# Fix PayPal 400 Error - SDK Failed to Load

## The Problem

You're seeing this error in the console:
```
Failed to load resource: the server responded with a status of 400
Failed to load the PayPal JS SDK script
```

This means PayPal is rejecting your Client ID. The Client ID is being passed correctly, but PayPal doesn't recognize it.

## Common Causes

1. **Sandbox App Not Published** - The app must be in "Published" status
2. **Invalid Client ID** - The Client ID might be incorrect or from a different app
3. **App Not Configured** - Missing required settings in the PayPal app
4. **Wrong Environment** - Using production Client ID in sandbox or vice versa

## Step-by-Step Fix

### Step 1: Verify Your PayPal Sandbox App

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)
2. Log in to your PayPal Developer account
3. Navigate to **My Apps & Credentials** → **Sandbox** tab
4. Find your app (or create a new one if needed)

### Step 2: Check App Status

1. Click on your app name
2. Verify the app status shows **"Published"** (not "Draft")
3. If it's in Draft mode:
   - Click **"Publish"** or **"Activate"** button
   - Wait for confirmation

### Step 3: Verify Client ID

1. In your app details, find the **"Client ID"** field
2. **Copy the entire Client ID** (it should be very long, like: `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`)
3. Make sure it matches exactly what's in your Vercel environment variables

### Step 4: Check App Features

1. In your app settings, verify:
   - **Features:** Should include "Accept Payments"
   - **Return URL:** Can be set to your Vercel URL (optional for client-side)
   - **Cancel URL:** Can be set to your Vercel URL (optional for client-side)

### Step 5: Update Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `VITE_PAYPAL_CLIENT_ID`
3. **Delete it** and **re-add it** with the exact Client ID from Step 3
4. Make sure there are:
   - No extra spaces
   - No line breaks
   - No quotes around the value
5. Select all environments (Production, Preview, Development)
6. Click **Save**

### Step 6: Create a New Sandbox App (If Still Not Working)

If the above doesn't work, create a fresh app:

1. In PayPal Developer Dashboard, click **"Create App"**
2. Fill in:
   - **App Name:** `Resergo E-Wallet` (or any name)
   - **Merchant:** Select your sandbox business account
   - **Features:** Select **"Accept Payments"**
3. Click **"Create App"**
4. **Copy the new Client ID**
5. Update Vercel environment variable with the new Client ID
6. Redeploy your application

### Step 7: Redeploy

1. Go to Vercel → Deployments
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Verify the Fix

After redeploying:
1. Open your Vercel site
2. Go to E-Wallet → Top Up
3. Enter an amount
4. You should see the PayPal button (not just the error)
5. Check the browser console - the 400 error should be gone

## Still Getting 400 Error?

If you're still getting a 400 error after following all steps:

1. **Double-check the Client ID:**
   - Copy it directly from PayPal Dashboard (don't type it)
   - Make sure it's the **Sandbox** Client ID (not Production)
   - Verify it's exactly 80+ characters long

2. **Check PayPal Account Status:**
   - Make sure your PayPal Developer account is verified
   - Check if there are any account restrictions

3. **Try a Different Browser:**
   - Sometimes browser extensions can interfere
   - Try in incognito/private mode

4. **Check Network Tab:**
   - Open DevTools → Network tab
   - Try to top up again
   - Look for the PayPal SDK request
   - Check the full error response from PayPal

## Quick Checklist

- [ ] PayPal Sandbox app is **Published** (not Draft)
- [ ] Client ID matches exactly in Vercel environment variables
- [ ] No spaces or line breaks in the Client ID
- [ ] Using **Sandbox** Client ID (not Production)
- [ ] App has "Accept Payments" feature enabled
- [ ] Vercel environment variable is set for all environments
- [ ] Application has been redeployed after setting the variable


## The Problem

You're seeing this error in the console:
```
Failed to load resource: the server responded with a status of 400
Failed to load the PayPal JS SDK script
```

This means PayPal is rejecting your Client ID. The Client ID is being passed correctly, but PayPal doesn't recognize it.

## Common Causes

1. **Sandbox App Not Published** - The app must be in "Published" status
2. **Invalid Client ID** - The Client ID might be incorrect or from a different app
3. **App Not Configured** - Missing required settings in the PayPal app
4. **Wrong Environment** - Using production Client ID in sandbox or vice versa

## Step-by-Step Fix

### Step 1: Verify Your PayPal Sandbox App

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)
2. Log in to your PayPal Developer account
3. Navigate to **My Apps & Credentials** → **Sandbox** tab
4. Find your app (or create a new one if needed)

### Step 2: Check App Status

1. Click on your app name
2. Verify the app status shows **"Published"** (not "Draft")
3. If it's in Draft mode:
   - Click **"Publish"** or **"Activate"** button
   - Wait for confirmation

### Step 3: Verify Client ID

1. In your app details, find the **"Client ID"** field
2. **Copy the entire Client ID** (it should be very long, like: `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`)
3. Make sure it matches exactly what's in your Vercel environment variables

### Step 4: Check App Features

1. In your app settings, verify:
   - **Features:** Should include "Accept Payments"
   - **Return URL:** Can be set to your Vercel URL (optional for client-side)
   - **Cancel URL:** Can be set to your Vercel URL (optional for client-side)

### Step 5: Update Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `VITE_PAYPAL_CLIENT_ID`
3. **Delete it** and **re-add it** with the exact Client ID from Step 3
4. Make sure there are:
   - No extra spaces
   - No line breaks
   - No quotes around the value
5. Select all environments (Production, Preview, Development)
6. Click **Save**

### Step 6: Create a New Sandbox App (If Still Not Working)

If the above doesn't work, create a fresh app:

1. In PayPal Developer Dashboard, click **"Create App"**
2. Fill in:
   - **App Name:** `Resergo E-Wallet` (or any name)
   - **Merchant:** Select your sandbox business account
   - **Features:** Select **"Accept Payments"**
3. Click **"Create App"**
4. **Copy the new Client ID**
5. Update Vercel environment variable with the new Client ID
6. Redeploy your application

### Step 7: Redeploy

1. Go to Vercel → Deployments
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Verify the Fix

After redeploying:
1. Open your Vercel site
2. Go to E-Wallet → Top Up
3. Enter an amount
4. You should see the PayPal button (not just the error)
5. Check the browser console - the 400 error should be gone

## Still Getting 400 Error?

If you're still getting a 400 error after following all steps:

1. **Double-check the Client ID:**
   - Copy it directly from PayPal Dashboard (don't type it)
   - Make sure it's the **Sandbox** Client ID (not Production)
   - Verify it's exactly 80+ characters long

2. **Check PayPal Account Status:**
   - Make sure your PayPal Developer account is verified
   - Check if there are any account restrictions

3. **Try a Different Browser:**
   - Sometimes browser extensions can interfere
   - Try in incognito/private mode

4. **Check Network Tab:**
   - Open DevTools → Network tab
   - Try to top up again
   - Look for the PayPal SDK request
   - Check the full error response from PayPal

## Quick Checklist

- [ ] PayPal Sandbox app is **Published** (not Draft)
- [ ] Client ID matches exactly in Vercel environment variables
- [ ] No spaces or line breaks in the Client ID
- [ ] Using **Sandbox** Client ID (not Production)
- [ ] App has "Accept Payments" feature enabled
- [ ] Vercel environment variable is set for all environments
- [ ] Application has been redeployed after setting the variable

