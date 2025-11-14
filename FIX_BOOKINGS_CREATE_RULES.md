# Fix: Bookings Create Permission Error

## Issue

When trying to create a booking, you're getting:
```
Error creating booking: FirebaseError: Missing or insufficient permissions.
```

## Root Cause

The Firestore security rules for the `bookings` collection are either:
1. **Missing** from your Firestore rules
2. **Incorrect** - they don't allow guests to create bookings
3. **Too strict** - they validate fields that might not be set correctly

## Quick Fix

### Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: `rgdatabase-10798`
3. Navigate to **Firestore Database** → **Rules** tab

### Step 2: Add or Update Bookings Collection Rules

**If the bookings collection rules are missing, add this section:**

```javascript
// Bookings collection
match /bookings/{bookingId} {
  // Users can read bookings where they are the guest or host
  allow read: if isAuthenticated() && 
                 (resource.data.guestId == request.auth.uid ||
                  resource.data.hostId == request.auth.uid);
  
  // ✅ Guests can create bookings - SIMPLIFIED RULE
  allow create: if isAuthenticated() && 
                   request.resource.data.guestId == request.auth.uid;
  
  // Hosts and guests can update bookings
  allow update: if isAuthenticated() && 
                   (resource.data.hostId == request.auth.uid ||
                    resource.data.guestId == request.auth.uid);
}
```

**If the bookings collection rules already exist, check that the create rule looks like this:**

```javascript
allow create: if isAuthenticated() && 
                 request.resource.data.guestId == request.auth.uid;
```

**⚠️ IMPORTANT: Make sure the rule is SIMPLE - don't add too many validations that might fail.**

### Step 3: Publish Rules

1. Click **Publish** button (top right)
2. Wait 1-2 minutes for rules to propagate
3. Clear browser cache (Ctrl+Shift+R)
4. Test creating a booking

## Complete Rules Section for Bookings:

Here's the complete bookings collection rules that should work:

```javascript
// Bookings collection
match /bookings/{bookingId} {
  // Read: Users can read bookings where they are the guest or host
  allow read: if isAuthenticated() && 
                 (resource.data.guestId == request.auth.uid ||
                  resource.data.hostId == request.auth.uid);
  
  // Create: Guests can create bookings where they are the guest
  // SIMPLIFIED - only check that guestId matches authenticated user
  allow create: if isAuthenticated() && 
                   request.resource.data.guestId == request.auth.uid;
  
  // Update: Hosts and guests can update bookings they're associated with
  allow update: if isAuthenticated() && 
                   (resource.data.hostId == request.auth.uid ||
                    resource.data.guestId == request.auth.uid);
  
  // Delete: Not allowed (for booking history)
  allow delete: if false;
}
```

## Where to Add This in Your Rules:

Add this section **after** the coupons collection rules and **before** the closing braces:

```javascript
    // Coupons collection
    match /coupons/{couponId} {
      // ... existing coupon rules ...
    }
    
    // ✅ ADD BOOKINGS COLLECTION RULES HERE
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && 
                     (resource.data.guestId == request.auth.uid ||
                      resource.data.hostId == request.auth.uid);
      allow create: if isAuthenticated() && 
                       request.resource.data.guestId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       (resource.data.hostId == request.auth.uid ||
                        resource.data.guestId == request.auth.uid);
      allow delete: if false;
    }
  }
}
```

## What This Rule Does:

1. **Read**: Users can read bookings where they are the guest (`guestId`) or host (`hostId`)
2. **Create**: 
   - User must be authenticated
   - The `guestId` in the booking data must match the authenticated user's UID
   - This allows any authenticated user (guest) to create a booking for themselves
3. **Update**: Both hosts and guests can update bookings they're associated with
4. **Delete**: Not allowed (for booking history)

## Verification Steps:

1. **Check if rules are published**:
   - Go to Firebase Console → Firestore Database → Rules
   - Look for the `bookings` collection rules
   - If missing, add them
   - Click "Publish"

2. **Wait for propagation**:
   - Rules may take 1-2 minutes to propagate
   - Wait at least 2 minutes after publishing

3. **Clear browser cache**:
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - This clears cached rules

4. **Test creating a booking**:
   - Log in as a guest
   - Go to a listing detail page
   - Fill in booking form
   - Click "Book Now"
   - Check browser console for errors

5. **Verify in Firestore**:
   - Go to Firebase Console → Firestore Database → Data
   - Look for the `bookings` collection
   - Verify the booking was created

## Troubleshooting:

### Error: "Missing or insufficient permissions" (Still happening)

**Checklist:**
- [ ] Rules are published in Firebase Console
- [ ] Waited 1-2 minutes after publishing
- [ ] Cleared browser cache
- [ ] User is authenticated (logged in)
- [ ] `guestId` in booking data matches `auth.currentUser.uid`
- [ ] Bookings collection rules are present in Firebase Console

**Debug Steps:**
1. Open browser console
2. Check `auth.currentUser.uid` - should not be null
3. Check the booking data being created
4. Verify `guestId` matches `auth.currentUser.uid`
5. Check Firebase Console → Firestore Database → Rules for syntax errors

### Error: "guestId doesn't match"

**Possible causes:**
1. The `guestId` in the booking data doesn't match the authenticated user's UID
2. The user is not logged in

**Fix:**
1. Verify user is logged in: `console.log(auth.currentUser.uid)`
2. Check that `bookingData.guestId` matches `auth.currentUser.uid`
3. Check the `createBooking` function in `Config.js` - line 1869 should be:
   ```javascript
   guestId: guestId, // where guestId = auth.currentUser.uid
   ```

### Error: "Rules not found"

**Possible causes:**
1. Bookings collection rules are missing from Firestore rules
2. Rules were not published

**Fix:**
1. Go to Firebase Console → Firestore Database → Rules
2. Add the bookings collection rules (see above)
3. Click "Publish"
4. Wait 1-2 minutes
5. Clear browser cache
6. Try again

## Simplified Rule (If Above Doesn't Work):

If the above rule still doesn't work, try this even simpler version:

```javascript
// Bookings collection - SIMPLIFIED
match /bookings/{bookingId} {
  // Allow authenticated users to read their own bookings
  allow read: if isAuthenticated();
  
  // Allow authenticated users to create bookings
  allow create: if isAuthenticated();
  
  // Allow authenticated users to update bookings
  allow update: if isAuthenticated();
  
  // No delete
  allow delete: if false;
}
```

**⚠️ Note:** This is less secure but will work. Once it's working, you can add back the more specific rules.

## Testing:

1. **Log in** as a guest
2. **Go to a listing** detail page
3. **Fill in booking form**:
   - Select check-in date
   - Select check-out date
   - Enter number of guests
4. **Click "Book Now"** button
5. **Check browser console** for errors
6. **Verify booking** is created in Firestore

## Expected Behavior:

After updating the rules:
- ✅ Guests can create bookings
- ✅ Bookings are created with `status: "pending"`
- ✅ Bookings are visible to both guest and host
- ✅ Hosts can approve/reject bookings
- ✅ Guests can request to cancel bookings

## Important Notes:

- **Simplified rule**: The create rule only checks that the user is authenticated and the `guestId` matches their UID
- **No field validation**: We're not validating other fields in the rule to avoid issues
- **Field validation in code**: The `createBooking` function in `Config.js` handles field validation
- **Wait for propagation**: Rules may take 1-2 minutes to propagate after publishing
- **Clear cache**: Always clear browser cache after updating rules

## Support:

If you continue to have issues:
1. Check Firebase Console → Firestore Database → Rules for syntax errors
2. Check browser console for specific error messages
3. Verify authentication status: `console.log(auth.currentUser)`
4. Verify booking data: `console.log(bookingData)`
5. Test with a different user account
6. Contact Firebase support if needed

