# Quick PayPal Setup

## The Warning You're Seeing

The warning "⚠️ PayPal Not Configured" appears because your PayPal Client ID is not set in your `.env` file.

## Quick Fix

1. **Open your `.env` file** in the root of your project

2. **Add or update this line:**
   ```
   VITE_PAYPAL_CLIENT_ID=AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH
   ```

3. **Make sure:**
   - No spaces around the `=` sign
   - No quotes around the Client ID
   - The file is named exactly `.env` (not `.env.txt` or anything else)

4. **Restart your development server:**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

5. **Refresh your browser**

## Verify It's Working

After restarting, the warning should disappear and you should see the PayPal button when you try to top up your e-wallet.

## For Vercel Deployment

If you're deploying to Vercel, you also need to add this environment variable in Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name:** `VITE_PAYPAL_CLIENT_ID`
   - **Value:** `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`
4. Redeploy your application

## Troubleshooting

- **Warning still showing?** Make sure you restarted the dev server after adding the variable
- **Variable not loading?** Check that the variable name is exactly `VITE_PAYPAL_CLIENT_ID` (case-sensitive)
- **Still not working?** Check the browser console for any errors


## The Warning You're Seeing

The warning "⚠️ PayPal Not Configured" appears because your PayPal Client ID is not set in your `.env` file.

## Quick Fix

1. **Open your `.env` file** in the root of your project

2. **Add or update this line:**
   ```
   VITE_PAYPAL_CLIENT_ID=AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH
   ```

3. **Make sure:**
   - No spaces around the `=` sign
   - No quotes around the Client ID
   - The file is named exactly `.env` (not `.env.txt` or anything else)

4. **Restart your development server:**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

5. **Refresh your browser**

## Verify It's Working

After restarting, the warning should disappear and you should see the PayPal button when you try to top up your e-wallet.

## For Vercel Deployment

If you're deploying to Vercel, you also need to add this environment variable in Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name:** `VITE_PAYPAL_CLIENT_ID`
   - **Value:** `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`
4. Redeploy your application

## Troubleshooting

- **Warning still showing?** Make sure you restarted the dev server after adding the variable
- **Variable not loading?** Check that the variable name is exactly `VITE_PAYPAL_CLIENT_ID` (case-sensitive)
- **Still not working?** Check the browser console for any errors

