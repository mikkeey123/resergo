# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in your Vercel dashboard. Click "Add Another" for each one:

### 1. PayPal Integration
- **Key:** `VITE_PAYPAL_CLIENT_ID`
- **Value:** `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`

### 2. EmailJS Configuration
- **Key:** `VITE_EMAILJS_PUBLIC_KEY`
- **Value:** `BCWKT-neLyeOkJ-Lz`

- **Key:** `VITE_EMAILJS_SERVICE_ID`
- **Value:** `service_2q8vvwm`

- **Key:** `VITE_EMAILJS_TEMPLATE_ID_HOST`
- **Value:** `template_pjxc82i`

- **Key:** `VITE_EMAILJS_TEMPLATE_ID_GUEST`
- **Value:** `template_z495ecl`

- **Key:** `VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL`
- **Value:** `template_d5qa8cd`

- **Key:** `VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION`
- **Value:** `template_9508bwo`

### 3. Firebase Configuration (Optional - has fallback values)
These are optional since your code has fallback values, but you can add them if you want to override:

- **Key:** `VITE_FIREBASE_API_KEY`
- **Value:** `AIzaSyBE4Z_pEiwkhYUSfBy1P33wUDQ2ZcFjHJA`

- **Key:** `VITE_FIREBASE_AUTH_DOMAIN`
- **Value:** `rgdatabase-10798.firebaseapp.com`

- **Key:** `VITE_FIREBASE_DATABASE_URL`
- **Value:** `https://rgdatabase-10798-default-rtdb.firebaseio.com`

- **Key:** `VITE_FIREBASE_PROJECT_ID`
- **Value:** `rgdatabase-10798`

- **Key:** `VITE_FIREBASE_STORAGE_BUCKET`
- **Value:** `rgdatabase-10798.firebasestorage.app`

- **Key:** `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value:** `444928906589`

- **Key:** `VITE_FIREBASE_APP_ID`
- **Value:** `1:444928906589:web:d3a800f61f7dbc22a404b4`

- **Key:** `VITE_FIREBASE_MEASUREMENT_ID`
- **Value:** `G-P3E5B4MEJF`

## Quick Setup Steps

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Environment Variables**
   - Select **"All Environments"** (or Production/Preview/Development as needed)

2. **Add Each Variable:**
   - Click "Add Another" for each key-value pair above
   - Make sure to use the exact key names (case-sensitive)
   - No spaces before or after the values

3. **Save:**
   - Click the **"Save"** button at the bottom

4. **Redeploy:**
   - After saving, go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **"Redeploy"** to apply the new environment variables

## Important Notes

- ✅ All keys must start with `VITE_` (required for Vite to expose them)
- ✅ No quotes needed around values
- ✅ Make sure there are no extra spaces
- ✅ After adding variables, you **must redeploy** for them to take effect
- ✅ The PayPal Client ID you provided is already included above

## Minimum Required Variables

If you want to add only the essential ones first:
1. `VITE_PAYPAL_CLIENT_ID` - For PayPal integration
2. `VITE_EMAILJS_PUBLIC_KEY` - For email sending
3. `VITE_EMAILJS_SERVICE_ID` - For email sending
4. `VITE_EMAILJS_TEMPLATE_ID_HOST` - For host registration emails
5. `VITE_EMAILJS_TEMPLATE_ID_GUEST` - For guest registration emails
6. `VITE_EMAILJS_TEMPLATE_ID_BOOKING_APPROVAL` - For booking approval emails
7. `VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION` - For booking rejection emails

