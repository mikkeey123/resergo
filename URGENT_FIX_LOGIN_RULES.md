# URGENT: Fix Login Form Rules & Regulations Error

## The Error
```
Error fetching rules & regulations: FirebaseError: Missing or insufficient permissions.
```

This happens because the login form tries to fetch rules **before** the user is authenticated, but the Firestore rules require authentication.

## Quick Fix (2 minutes)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **rgdatabase-10798**
3. Click **Firestore Database** → **Rules** tab

### Step 2: Update the Platform Settings Rule
Find this section in your rules:
```javascript
match /platformSettings/{documentId} {
  allow read: if isAuthenticated();
  ...
}
```

**Change it to:**
```javascript
match /platformSettings/{documentId} {
  // Allow anyone to read (needed for login/signup modal before authentication)
  allow read: if true;
  // Only admins can create, update, or delete
  allow create: if isAdmin();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

### Step 3: Publish
1. Click **Publish** button
2. Refresh your browser (Ctrl+F5)
3. The error should be gone!

## Why This Is Safe

- ✅ Rules & Regulations are **public information** that users need to see before signing up
- ✅ Only **read** access is public (anyone can view)
- ✅ Only **admins** can create, update, or delete
- ✅ This is standard practice - terms of service are always publicly readable

## Alternative: Use Updated Rules File

If you prefer, you can copy the entire updated rules from `FIRESTORE_RULES_ADMIN_FIX.txt` which already has this fix applied.

