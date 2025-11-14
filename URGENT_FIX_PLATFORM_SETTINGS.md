# URGENT: Fix Platform Settings Permission Error

## The Error
```
Config.js:2475 Error fetching rules & regulations: FirebaseError: Missing or insufficient permissions.
```

## Quick Fix (2 minutes)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **rgdatabase-10798**
3. Click **Firestore Database** → **Rules** tab

### Step 2: Copy & Paste New Rules
1. Open `FIRESTORE_RULES_ADMIN_FIX.txt` in your project
2. **Copy ALL the content** (Ctrl+A, Ctrl+C)
3. In Firebase Console, **delete all existing rules**
4. **Paste the new rules** (Ctrl+V)
5. Click **Publish** button

### Step 3: Verify
1. Refresh your browser (Ctrl+F5 to hard refresh)
2. Check the console - the error should be gone

## What the Rules Do

The `platformSettings` collection now allows:
- ✅ **Read**: Any authenticated user (needed for login/signup modal)
- ✅ **Create/Update/Delete**: Only admins

## If Still Not Working

1. **Check your user document exists:**
   - Go to Firestore → `Resergodb` collection
   - Find your user ID document
   - Verify it has `UserType: "admin"`

2. **Check you're logged in:**
   - Make sure you're authenticated in the app
   - Try logging out and back in

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Verify rules were published:**
   - In Firebase Console → Rules tab
   - Check the timestamp shows "Published just now"
   - Make sure there are no syntax errors (red underlines)

## The Rules Section You Need

Make sure this section exists in your Firestore rules:

```javascript
// Platform Settings collection (for Rules & Regulations and Cancellation Rules)
match /platformSettings/{documentId} {
  // Allow all authenticated users to read (needed for login/signup modal)
  allow read: if isAuthenticated();
  // Only admins can create, update, or delete
  allow create: if isAdmin();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

