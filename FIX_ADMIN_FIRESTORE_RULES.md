# Fix Admin Firestore Permission Errors

## The Problem

You're seeing these errors in the console:
- `Error fetching all listings: FirebaseError: Missing or insufficient permissions`
- `Error fetching all transactions: FirebaseError: Missing or insufficient permissions`
- `Error fetching rules & regulations: FirebaseError: Missing or insufficient permissions`
- `Error saving rules & regulations: FirebaseError: Missing or insufficient permissions`

## The Solution

The Firestore security rules need to be updated to allow admin users to access these collections.

## Step-by-Step Fix

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **rgdatabase-10798**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top

### Step 2: Replace the Rules
1. **Copy the entire content** from `FIRESTORE_RULES_ADMIN_FIX.txt`
2. **Delete all existing rules** in the Firebase Console
3. **Paste the new rules** from the file
4. Click **Publish**

### Step 3: Verify
After publishing, the admin page should be able to:
- ✅ Fetch all listings
- ✅ Fetch all transactions
- ✅ Fetch and save rules & regulations
- ✅ Fetch and save cancellation rules
- ✅ Fetch all bookings, reviews, and users

## What Changed

The new rules add:
1. **`isAdmin()` function** - Checks if the user is an admin
2. **Admin read access** to:
   - `listings` collection
   - `transactions` collection
   - `bookings` collection
   - `reviews` collection
   - `Resergodb` collection (users)
3. **Admin write access** to:
   - `platformSettings` collection (for rules & regulations and cancellation rules)

## Important Notes

- The rules check the user's `UserType` field in the `Resergodb` collection
- Make sure your admin account has `UserType: "admin"` in Firestore
- After updating the rules, refresh your browser to see the changes take effect

