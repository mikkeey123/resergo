# Fix PayPal 400 Error - Quick Checklist

## The Error
```
Failed to load resource: the server responded with a status of 400
Failed to load the PayPal JS SDK script
```

## This Means
PayPal is **rejecting your Client ID**. The Client ID is being sent, but PayPal doesn't recognize it.

## Quick Fix Checklist

### ✅ Step 1: Verify PayPal Sandbox App Status
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)
2. Log in to your PayPal Developer account
3. Navigate to **My Apps & Credentials** → **Sandbox** tab
4. **CRITICAL:** Find your app and check if it shows **"Published"** (not "Draft")
5. If it's in Draft mode, click **"Publish"** or **"Activate"**

### ✅ Step 2: Verify Client ID
1. In your PayPal app details, copy the **entire Client ID**
2. It should be very long (80+ characters)
3. Make sure it matches: `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`

### ✅ Step 3: Update Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com) → Your Project
2. Click **Settings** → **Environment Variables**
3. Find `VITE_PAYPAL_CLIENT_ID`
4. **Delete it completely**
5. **Add it again** with these exact settings:
   - **Name:** `VITE_PAYPAL_CLIENT_ID`
   - **Value:** `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`
   - **Environment:** ✅ Production ✅ Preview ✅ Development (select all three)
6. Click **Save**

### ✅ Step 4: Create a NEW Sandbox App (If Still Failing)
If the above doesn't work, create a fresh app:

1. In PayPal Developer Dashboard, click **"Create App"**
2. Fill in:
   - **App Name:** `Resergo E-Wallet` (or any name)
   - **Merchant:** Select your sandbox business account
   - **Features:** Select **"Accept Payments"**
3. Click **"Create App"**
4. **Copy the NEW Client ID** (it will be different)
5. Update Vercel environment variable with the NEW Client ID
6. Make sure the app shows **"Published"** status

### ✅ Step 5: Redeploy on Vercel
1. Go to Vercel → **Deployments**
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (1-2 minutes)

### ✅ Step 6: Clear Browser Cache
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache completely

## Most Common Issues

1. **App Not Published** - The app must be in "Published" status, not "Draft"
2. **Wrong Client ID** - Using Production Client ID instead of Sandbox (or vice versa)
3. **Environment Variable Not Set** - Missing in Vercel or has extra spaces/line breaks
4. **Old/Invalid Client ID** - The Client ID might have been deleted or expired

## Verify It's Fixed

After redeploying:
- The 400 error should disappear from the console
- The PayPal button should appear when you try to top up
- You should be able to complete test payments

## Still Not Working?

If you're still getting a 400 error after all steps:
1. Check the Network tab in DevTools
2. Look for the PayPal SDK request
3. Check the full error response from PayPal
4. Verify the Client ID in the request URL matches your PayPal Dashboard

