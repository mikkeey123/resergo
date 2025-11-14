# Update PayPal Client ID

## Your New PayPal Client ID
```
AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFmDH
```

## Step 1: Update Local .env File

1. Open your `.env` file in the project root (create it if it doesn't exist)
2. Add or update this line:

```env
VITE_PAYPAL_CLIENT_ID=AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFmDH
```

**Important:**
- ✅ No spaces around the `=`
- ✅ No quotes around the Client ID
- ✅ Entire Client ID on one line (no line breaks)
- ✅ Make sure there are no extra spaces at the end

3. **Restart your development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then start again:
   npm run dev
   ```

## Step 2: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **ReserGo** project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_PAYPAL_CLIENT_ID` (or create it if it doesn't exist)
5. Update the value to:
   ```
   AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFmDH
   ```
6. **Important:** Select all environments (Production, Preview, Development)
7. Click **Save**
8. **Redeploy your app:**
   - Go to **Deployments** tab
   - Click the **three dots** (⋯) on the latest deployment
   - Click **Redeploy**

## Step 3: Verify It Works

1. **Local Testing:**
   - Open your app: `http://localhost:5173` (or your dev server URL)
   - Go to E-Wallet / Top Up
   - Enter an amount
   - You should see the **PayPal button** (not an error)

2. **Vercel Testing:**
   - Wait for redeploy to complete
   - Visit your Vercel URL
   - Go to E-Wallet / Top Up
   - Enter an amount
   - You should see the **PayPal button** (not an error)

## Troubleshooting

### Still seeing "PayPal Not Configured" warning?
- ✅ Check `.env` file exists and has the correct variable name
- ✅ Restart your dev server after updating `.env`
- ✅ Check for typos in the Client ID
- ✅ Make sure there are no extra spaces

### Still seeing 400 error?
1. **Verify PayPal App Status:**
   - Go to: https://developer.paypal.com/dashboard/applications/sandbox
   - Check that your app is **"Published"** (not Draft)

2. **Verify Client ID:**
   - Copy the Client ID directly from PayPal Dashboard
   - Make sure it matches exactly (no extra characters)

3. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## Quick Checklist

- [ ] `.env` file updated with new Client ID
- [ ] Dev server restarted
- [ ] Vercel environment variable updated
- [ ] Vercel app redeployed
- [ ] PayPal app is "Published" in PayPal Dashboard
- [ ] Tested locally - PayPal button appears
- [ ] Tested on Vercel - PayPal button appears

---

**Note:** The `.env` file is in `.gitignore` (not committed to Git) for security. Make sure to update it locally and in Vercel separately.

