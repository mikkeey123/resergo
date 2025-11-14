# Fix: Rules & Regulations Permission Error

## The Problem

The error `Error fetching rules & regulations: FirebaseError: Missing or insufficient permissions` occurs because:

1. Users need to view rules **before** logging in (on the login/signup form)
2. The current Firestore rule requires authentication: `allow read: if isAuthenticated()`
3. But users aren't authenticated yet when viewing the login page!

## The Solution

Change the `platformSettings` read rule to allow **public reads** (no authentication required).

## Quick Fix

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **rgdatabase-10798**
3. Click **Firestore Database** → **Rules** tab

### Step 2: Find This Section
Look for the `platformSettings` collection rules:

```javascript
match /platformSettings/{documentId} {
  allow read: if isAuthenticated();  // ❌ This is the problem
  allow create: if isAdmin();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

### Step 3: Change the Read Rule
Change `allow read: if isAuthenticated();` to:

```javascript
allow read: if true;  // ✅ Allow public reads
```

### Step 4: Publish
1. Click **Publish** button
2. Wait for "Published successfully"

### Step 5: Refresh Browser
- Hard refresh: Ctrl+Shift+R
- The error should be gone! ✅

## Updated Rules Section

The complete `platformSettings` section should look like this:

```javascript
// Platform Settings collection (for Rules & Regulations and Cancellation Rules)
match /platformSettings/{documentId} {
  // Allow anyone to read (needed for login/signup modal before authentication)
  allow read: if true;
  // Only admins can create, update, or delete
  allow create: if isAdmin();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

## Why This Is Safe

- ✅ Rules & Regulations are meant to be **public** (users need to read them before signing up)
- ✅ Only **admins** can create, update, or delete (write operations are still protected)
- ✅ This is a common pattern for public content that needs to be readable before authentication

## Alternative: Use Updated Rules File

Or simply copy the updated `FIRESTORE_RULES_ADMIN_FIX.txt` file which already has this fix applied!

