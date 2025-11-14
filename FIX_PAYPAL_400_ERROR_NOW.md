# Fix PayPal 400 Error - Immediate Action Required

## The Error
```
Failed to load resource: the server responded with a status of 400
Failed to load the PayPal JS SDK script
```

**Your Client ID:** `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`

## What This Means
PayPal is **rejecting your Client ID**. The Client ID is being sent correctly, but PayPal doesn't recognize it as valid.

## Most Common Causes
1. ❌ **App is in "Draft" status** (not Published)
2. ❌ **Client ID is incorrect or copied wrong**
3. ❌ **App was deleted or deactivated**
4. ❌ **PayPal Developer account issues**

## Quick Fix Steps

### Step 1: Check PayPal Sandbox App Status

1. Go to: https://developer.paypal.com/dashboard/applications/sandbox
2. Log in to your PayPal Developer account
3. Find your app (or create a new one)
4. **CRITICAL:** Check the app status:
   - ✅ **"Published"** = Good (should work)
   - ❌ **"Draft"** = Bad (won't work - needs to be published)

### Step 2: Publish Your App (If Draft)

If your app shows "Draft":

1. Click on your app to open it
2. Look for a **"Publish"** or **"Activate"** button
3. Click it to publish the app
4. Wait 1-2 minutes for changes to propagate
5. Refresh your app and try again

### Step 3: Verify Client ID

1. In PayPal Developer Dashboard, open your app
2. Copy the **Client ID** directly (don't type it)
3. Make sure there are:
   - ✅ No extra spaces
   - ✅ No line breaks
   - ✅ No special characters

### Step 4: Update Environment Variables

**For Local Development (.env file):**
```env
VITE_PAYPAL_CLIENT_ID=AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH
```

**For Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find or add: `VITE_PAYPAL_CLIENT_ID`
3. Paste the Client ID (no spaces, no quotes)
4. **Redeploy** your app

### Step 5: Create New App (If Still Not Working)

If the app is published but still not working:

1. In PayPal Developer Dashboard, click **"Create App"**
2. Name it: `ReserGo Production` (or any name)
3. Select **"Merchant"** as the app type
4. Click **"Create App"**
5. **Copy the new Client ID**
6. Update your `.env` and Vercel with the new Client ID
7. **Redeploy** your app

## Verification Checklist

After fixing, verify:

- [ ] PayPal Sandbox app status is **"Published"** (not Draft)
- [ ] Client ID is copied correctly (no extra spaces)
- [ ] `.env` file has `VITE_PAYPAL_CLIENT_ID=...` (no quotes)
- [ ] Vercel environment variable is set correctly
- [ ] App has been redeployed after changes
- [ ] Browser cache cleared (Ctrl+Shift+R)

## Test After Fixing

1. Open your app
2. Go to E-Wallet / Top Up
3. Enter an amount
4. You should see the **PayPal button** (not an error)

## Still Not Working?

### Check Browser Console
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Look for the PayPal SDK request
4. Check the **Response** tab for detailed error message

### Common Error Messages:
- **"Invalid Client ID"** → Client ID is wrong or app is Draft
- **"App not found"** → App was deleted, create a new one
- **"Unauthorized"** → PayPal account needs verification

### Contact PayPal Support
If nothing works, contact PayPal Developer Support:
- https://developer.paypal.com/support

---

## Quick Summary

**Most likely fix:** Your PayPal Sandbox app is in "Draft" status. Go to PayPal Developer Dashboard and **publish** it.

**If that doesn't work:** Create a new PayPal Sandbox app and use the new Client ID.

