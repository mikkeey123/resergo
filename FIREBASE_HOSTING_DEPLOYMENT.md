# Firebase Hosting Deployment Guide

Complete guide to deploy your ReserGo project to Firebase Hosting.

## Prerequisites

1. **Node.js** installed (you already have this)
2. **Firebase CLI** installed
3. **Firebase project** set up (`rgdatabase-10798`)

## Step 1: Install Firebase CLI

Open your terminal and run:

```bash
npm install -g firebase-tools
```

Or if you prefer using npx (no global install needed):
```bash
npx firebase-tools --version
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate with your Google account.

## Step 3: Verify Firebase Project

Check that you're connected to the correct project:

```bash
firebase projects:list
```

You should see `rgdatabase-10798` in the list.

## Step 4: Initialize Firebase Hosting (if needed)

If you haven't initialized Firebase Hosting yet, run:

```bash
firebase init hosting
```

**When prompted:**
- ✅ **Use an existing project**: Select `rgdatabase-10798`
- ✅ **Public directory**: Type `dist` (this is where Vite builds your app)
- ✅ **Single-page app**: Type `Yes` (for React Router support)
- ✅ **Set up automatic builds**: Type `No` (we'll deploy manually)
- ✅ **Overwrite index.html**: Type `No` (we already have one)

**Note:** The `firebase.json` and `.firebaserc` files are already created for you, so you can skip this step if they exist.

## Step 5: Build Your Project

Before deploying, build your React app:

```bash
npm run build
```

This creates the `dist/` folder with your production-ready files.

## Step 6: Deploy to Firebase Hosting

Deploy your app:

```bash
firebase deploy --only hosting
```

**First time deployment:**
- Firebase will ask you to confirm the project
- Type `Yes` to proceed

## Step 7: Access Your Deployed App

After deployment, Firebase will show you the hosting URL:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/rgdatabase-10798/overview
Hosting URL: https://rgdatabase-10798.web.app
```

Your app is now live! 🎉

## Environment Variables on Firebase

Since you're using environment variables (`.env`), you need to configure them in Firebase Hosting.

### Option 1: Use Firebase Functions (Recommended for sensitive data)

For production, consider using Firebase Functions to handle environment variables securely.

### Option 2: Build-time Variables

For Vite, environment variables are embedded at build time. Make sure your `.env` file has all required variables before running `npm run build`.

**Required environment variables:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_PAYPAL_CLIENT_ID`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

**Important:** Never commit your `.env` file to Git! It's already in `.gitignore`.

## Updating Your Deployment

To update your app after making changes:

1. **Make your changes** in the code
2. **Build again:**
   ```bash
   npm run build
   ```
3. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

## Custom Domain (Optional)

To use a custom domain:

1. Go to [Firebase Console](https://console.firebase.google.com/project/rgdatabase-10798/hosting)
2. Click **Add custom domain**
3. Follow the instructions to verify your domain
4. Update your DNS records as instructed

## Troubleshooting

### Error: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Error: "No Firebase project found"
Make sure `.firebaserc` exists and has the correct project ID:
```json
{
  "projects": {
    "default": "rgdatabase-10798"
  }
}
```

### Error: "Build failed"
- Check that all dependencies are installed: `npm install`
- Check for TypeScript/ESLint errors: `npm run lint`
- Make sure your `.env` file has all required variables

### Error: "Permission denied"
- Make sure you're logged in: `firebase login`
- Verify you have access to the project: `firebase projects:list`

### App shows blank page
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure `firebase.json` has the correct rewrite rules for SPA

## Quick Deploy Script

You can create a deploy script in `package.json`:

```json
"scripts": {
  "deploy": "npm run build && firebase deploy --only hosting"
}
```

Then just run:
```bash
npm run deploy
```

## Firebase Hosting vs Vercel

**Current Setup:** You're using Vercel for deployment.

**Firebase Hosting Benefits:**
- ✅ Same platform as your Firestore database
- ✅ Free SSL certificate
- ✅ CDN included
- ✅ Easy integration with Firebase services
- ✅ Custom domains

**You can use both:**
- Keep Vercel for automatic deployments from GitHub
- Use Firebase Hosting for manual deployments or as backup

## Next Steps

1. ✅ Deploy to Firebase Hosting
2. ✅ Test all features (login, signup, bookings, etc.)
3. ✅ Set up custom domain (optional)
4. ✅ Configure Firebase Hosting environment variables if needed

---

**Need help?** Check the [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)

