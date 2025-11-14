# PayPal Sandbox Integration Setup Guide

This guide will help you set up PayPal Sandbox for testing e-wallet top-up functionality in your Resergo application.

## Prerequisites

- A PayPal Business Account (or Personal Account that can be upgraded)
- Node.js and npm installed
- Access to your project's environment variables

## Step 1: Create PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Click **"Log in"** or **"Sign up"** if you don't have an account
3. Use your existing PayPal account or create a new one
4. Complete the account verification process

## Step 2: Create a Sandbox Application

1. Once logged in, navigate to **Dashboard** → **My Apps & Credentials**
2. Click **"Create App"** button
3. Fill in the application details:
   - **App Name**: `Resergo E-Wallet` (or any name you prefer)
   - **Merchant**: Select your sandbox business account (or create one)
   - **Features**: Select **"Accept Payments"**
4. Click **"Create App"**

## Step 3: Get Your Sandbox Credentials

1. After creating the app, you'll see your **Client ID** and **Secret**
2. **Important**: You only need the **Client ID** for client-side integration
3. Copy the **Client ID** (it looks like: `AeA1QIZXiflr1_-...`)

## Step 4: Create Sandbox Test Accounts

1. Go to **Dashboard** → **Accounts** (or **Sandbox** → **Accounts**)
2. Click **"Create Account"**
3. Create two types of accounts:

   **Business Account (Merchant):**
   - Account Type: **Business**
   - Email: `merchant@resergo.test` (or any test email)
   - Password: Create a strong password (save it!)
   - Country: **Philippines**
   - Click **"Create Account"**

   **Personal Account (Buyer):**
   - Account Type: **Personal**
   - Email: `buyer@resergo.test` (or any test email)
   - Password: Create a strong password (save it!)
   - Country: **Philippines**
   - Click **"Create Account"**

4. **Note**: PayPal will automatically fund these accounts with test money

## Step 5: Configure Your Project

### 5.1 Install PayPal SDK

The PayPal SDK has already been installed. If you need to reinstall:

```bash
npm install @paypal/react-paypal-js
```

### 5.2 Set Environment Variables

1. Create or update your `.env` file in the project root:

```env
VITE_PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID_HERE
```

2. Replace `YOUR_SANDBOX_CLIENT_ID_HERE` with the Client ID from Step 3

3. **Important**: 
   - Never commit your `.env` file to version control
   - Add `.env` to your `.gitignore` file (already done)
   - The Client ID is safe to expose on the client-side (it's public)

### 5.3 Update PayPal Configuration

1. Open `src/config/paypal.js`
2. The configuration should already be set up, but verify it matches:

```javascript
export const PAYPAL_CONFIG = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "YOUR_SANDBOX_CLIENT_ID",
    environment: "sandbox", // Use "sandbox" for testing
    currency: "PHP",
    locale: "en_PH"
};
```

## Step 6: Test the Integration

### 6.1 Start Your Development Server

```bash
npm run dev
```

### 6.2 Test Top-Up Flow

1. Navigate to the E-Wallet page in your application
2. Click **"Top Up"** button
3. Enter an amount (e.g., `100.00`)
4. The PayPal button will appear below the amount input
5. Click the PayPal button
6. You'll be redirected to PayPal Sandbox login page
7. Use your **Personal (Buyer) Sandbox Account** credentials:
   - Email: `buyer@resergo.test` (or the email you created)
   - Password: The password you set
8. Complete the payment flow
9. You should see a success message and your wallet balance updated

### 6.3 Verify Transaction

1. Check your transaction history in the E-Wallet
2. The transaction should show:
   - Type: `topup`
   - Amount: The amount you paid
   - Status: `completed`
   - Payment Method: `PAYPAL`

## Step 7: Testing Different Scenarios

### Test Successful Payment
- Use valid sandbox buyer account
- Complete the payment flow
- Verify wallet balance increases

### Test Payment Cancellation
- Start payment flow
- Click "Cancel" on PayPal page
- Verify no balance change

### Test Payment Failure
- Use a sandbox account with insufficient funds
- Attempt payment
- Verify error handling

## Step 8: Switch to Production (When Ready)

When you're ready to go live:

1. **Create Production App:**
   - Go to PayPal Developer Dashboard
   - Create a new app with **"Live"** environment
   - Get your **Live Client ID**

2. **Update Configuration:**
   - Update `.env` with Live Client ID:
   ```env
   VITE_PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID
   ```
   - Update `src/config/paypal.js`:
   ```javascript
   environment: "production", // Change from "sandbox"
   ```

3. **Test with Real Money:**
   - Use real PayPal accounts
   - Start with small test amounts
   - Monitor transactions in PayPal Dashboard

## Troubleshooting

### Issue: PayPal button doesn't appear
- **Solution**: Check browser console for errors
- Verify `VITE_PAYPAL_CLIENT_ID` is set correctly
- Ensure PayPal SDK is loaded (check Network tab)
- Restart development server after changing `.env`

### Issue: "Invalid Client ID" error
- **Solution**: 
  - Verify Client ID in `.env` file
  - Restart development server after changing `.env`
  - Check for typos or extra spaces
  - Ensure you're using Sandbox Client ID (not Live)

### Issue: Payment succeeds but wallet doesn't update
- **Solution**:
  - Check browser console for errors
  - Verify `topUpWallet` function in `Config.js`
  - Check Firestore rules allow wallet updates
  - Verify transaction was created in Firestore

### Issue: CORS errors
- **Solution**: 
  - PayPal SDK handles CORS automatically
  - If issues persist, check your Vite configuration
  - Ensure you're using the correct environment (sandbox vs production)

### Issue: PayPal button shows "Loading..." indefinitely
- **Solution**:
  - Check if Client ID is valid
  - Verify internet connection
  - Check browser console for specific errors
  - Try clearing browser cache

## Security Best Practices

1. **Never expose Secret Key**: Only Client ID is needed for client-side
2. **Use Environment Variables**: Never hardcode credentials
3. **Verify Payments Server-Side**: In production, verify payments on your backend
4. **HTTPS Required**: PayPal requires HTTPS in production
5. **Validate Amounts**: Always validate amounts before processing

## Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal React SDK Documentation](https://github.com/paypal/react-paypal-js)
- [PayPal Sandbox Testing Guide](https://developer.paypal.com/docs/api-basics/sandbox/)
- [PayPal Support](https://www.paypal.com/support)

## Support

If you encounter issues:
1. Check PayPal Developer Dashboard for transaction logs
2. Review browser console for JavaScript errors
3. Verify all configuration steps were completed
4. Test with PayPal's sample integration first

---

**Note**: This integration uses PayPal's client-side SDK. For production, consider implementing server-side payment verification for enhanced security.

