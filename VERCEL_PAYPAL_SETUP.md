# Setting Up PayPal in Vercel

## Why the Warning Still Shows

The `.env` file fix only works for **local development**. For your Vercel deployment, you need to add the environment variable in Vercel's dashboard.

## Steps to Fix PayPal in Vercel

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account
   - Select your **resergo** project

2. **Navigate to Settings**
   - Click on your project name
   - Click on **Settings** in the top navigation
   - Click on **Environment Variables** in the left sidebar

3. **Add the PayPal Client ID**
   - Click **Add New** button
   - **Name:** `VITE_PAYPAL_CLIENT_ID`
   - **Value:** `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`
   - **Environment:** Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Redeploy Your Application**
   - Go to the **Deployments** tab
   - Click the **⋯** (three dots) menu on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a new deployment

5. **Wait for Deployment**
   - Wait for the deployment to complete (usually 1-2 minutes)
   - The warning should disappear after the new deployment is live

## Quick Visual Guide

```
Vercel Dashboard → Your Project → Settings → Environment Variables → Add New
```

## After Adding the Variable

Once you've added the environment variable and redeployed:
- The PayPal warning will disappear
- The PayPal button will appear when you try to top up
- PayPal payments will work on your Vercel deployment

## Important Notes

- Environment variables in Vercel are separate from your local `.env` file
- Changes to environment variables require a redeploy to take effect
- Make sure to select all environments (Production, Preview, Development) when adding the variable


## Why the Warning Still Shows

The `.env` file fix only works for **local development**. For your Vercel deployment, you need to add the environment variable in Vercel's dashboard.

## Steps to Fix PayPal in Vercel

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account
   - Select your **resergo** project

2. **Navigate to Settings**
   - Click on your project name
   - Click on **Settings** in the top navigation
   - Click on **Environment Variables** in the left sidebar

3. **Add the PayPal Client ID**
   - Click **Add New** button
   - **Name:** `VITE_PAYPAL_CLIENT_ID`
   - **Value:** `AZws3JJz7v5TXdZW3QI3PuYzQA9fVeA7b5D6M4uqkUcl9rvn0N5wJz18Rkr8781Viy2DloGjUmnJFjDH`
   - **Environment:** Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Redeploy Your Application**
   - Go to the **Deployments** tab
   - Click the **⋯** (three dots) menu on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a new deployment

5. **Wait for Deployment**
   - Wait for the deployment to complete (usually 1-2 minutes)
   - The warning should disappear after the new deployment is live

## Quick Visual Guide

```
Vercel Dashboard → Your Project → Settings → Environment Variables → Add New
```

## After Adding the Variable

Once you've added the environment variable and redeployed:
- The PayPal warning will disappear
- The PayPal button will appear when you try to top up
- PayPal payments will work on your Vercel deployment

## Important Notes

- Environment variables in Vercel are separate from your local `.env` file
- Changes to environment variables require a redeploy to take effect
- Make sure to select all environments (Production, Preview, Development) when adding the variable

