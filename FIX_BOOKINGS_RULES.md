# Fix: Bookings Collection Permission Error

## Issue

When trying to create a booking, you're getting:
```
Error creating booking: FirebaseError: Missing or insufficient permissions.
```

This means the Firestore security rules for the `bookings` collection are either missing or incorrect.

## Solution

Add or update the Firestore security rules for the `bookings` collection to allow guests to create bookings.

## Step-by-Step Instructions:

### Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: `rgdatabase-10798`
3. Navigate to **Firestore Database** → **Rules** tab

### Step 2: Add or Update Bookings Collection Rules

**Find if there's already a bookings collection rule.** If not, add this section after the coupons collection rules:

```javascript
// Bookings collection - for guest bookings
match /bookings/{bookingId} {
  // Users can read bookings where they are the guest or host
  allow read: if isAuthenticated() && 
                 (resource.data.guestId == request.auth.uid ||
                  resource.data.hostId == request.auth.uid);
  
  // ✅ Guests can create bookings where they are the guest
  allow create: if isAuthenticated() && 
                   request.resource.data.guestId == request.auth.uid &&
                   request.resource.data.guestId != null &&
                   request.resource.data.hostId != null &&
                   request.resource.data.listingId != null &&
                   request.resource.data.checkIn != null &&
                   request.resource.data.checkOut != null &&
                   request.resource.data.status == "pending";
  
  // Hosts and guests can update bookings
  allow update: if isAuthenticated() && 
                   (resource.data.hostId == request.auth.uid ||
                    resource.data.guestId == request.auth.uid);
  
  // No delete allowed (for booking history)
  allow delete: if false;
}
```

### Step 3: Publish Rules

1. Click **Publish** button (top right)
2. Wait 1-2 minutes for rules to propagate
3. Clear browser cache (Ctrl+Shift+R)
4. Test creating a booking

## Complete Updated Rules:

If you need the complete rules file, here's the full section for bookings:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/Resergodb/$(request.auth.uid)).data;
    }
    
    // Helper function to check if user is a host
    function isHost() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/Resergodb/$(request.auth.uid)) &&
             getUserData().UserType == 'host';
    }
    
    // Resergodb collection - user data
    match /Resergodb/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Listings collection
    match /listings/{listingId} {
      allow read: if resource.data.isDraft == false || 
                     (isAuthenticated() && resource.data.hostId == request.auth.uid);
      allow create: if isHost() && 
                       request.resource.data.hostId == request.auth.uid;
      allow update: if (isHost() && 
                       resource.data.hostId == request.auth.uid &&
                       request.resource.data.hostId == request.auth.uid) ||
                     (isAuthenticated() && 
                       request.resource.data.hostId == resource.data.hostId &&
                       request.resource.data.title == resource.data.title &&
                       request.resource.data.rate == resource.data.rate &&
                       request.resource.data.isDraft == resource.data.isDraft);
      allow delete: if isHost() && 
                       resource.data.hostId == request.auth.uid;
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                       request.resource.data.guestId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       resource.data.guestId == request.auth.uid &&
                       request.resource.data.guestId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       resource.data.guestId == request.auth.uid;
    }
    
    // Favorites collection
    match /favorites/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated() && 
                     (resource.data.senderId == request.auth.uid || 
                      resource.data.receiverId == request.auth.uid);
      allow create: if isAuthenticated() && 
                       request.resource.data.senderId == request.auth.uid &&
                       request.resource.data.receiverId != null &&
                       request.resource.data.message != null &&
                       request.resource.data.message is string &&
                       request.resource.data.message.size() > 0;
      allow update: if isAuthenticated() && 
                       resource.data.receiverId == request.auth.uid &&
                       request.resource.data.senderId == resource.data.senderId &&
                       request.resource.data.receiverId == resource.data.receiverId &&
                       request.resource.data.message == resource.data.message;
      allow delete: if isAuthenticated() && 
                       (resource.data.senderId == request.auth.uid ||
                        resource.data.receiverId == request.auth.uid);
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() && 
                     (resource.data.participant1Id == request.auth.uid || 
                      resource.data.participant2Id == request.auth.uid);
      allow create: if isAuthenticated() && 
                       (request.resource.data.participant1Id == request.auth.uid || 
                        request.resource.data.participant2Id == request.auth.uid);
      allow update: if isAuthenticated() && 
                       (resource.data.participant1Id == request.auth.uid || 
                        resource.data.participant2Id == request.auth.uid) &&
                       request.resource.data.participant1Id == resource.data.participant1Id &&
                       request.resource.data.participant2Id == resource.data.participant2Id;
      allow delete: if isAuthenticated() && 
                       (resource.data.participant1Id == request.auth.uid ||
                        resource.data.participant2Id == request.auth.uid);
    }
    
    // Wallets collection
    match /wallets/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if false;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.userId == request.auth.uid;
      allow delete: if false;
    }
    
    // Coupons collection
    match /coupons/{couponId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                       request.resource.data.hostId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       resource.data.hostId == request.auth.uid &&
                       request.resource.data.hostId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       resource.data.hostId == request.auth.uid;
    }
    
    // ✅ Bookings collection - ADD THIS IF MISSING
    match /bookings/{bookingId} {
      // Users can read bookings where they are the guest or host
      allow read: if isAuthenticated() && 
                     (resource.data.guestId == request.auth.uid ||
                      resource.data.hostId == request.auth.uid);
      
      // Guests can create bookings where they are the guest
      // Validate required fields: guestId, hostId, listingId, checkIn, checkOut, status
      allow create: if isAuthenticated() && 
                       request.resource.data.guestId == request.auth.uid &&
                       request.resource.data.guestId != null &&
                       request.resource.data.hostId != null &&
                       request.resource.data.listingId != null &&
                       request.resource.data.checkIn != null &&
                       request.resource.data.checkOut != null &&
                       request.resource.data.status == "pending";
      
      // Hosts and guests can update bookings
      allow update: if isAuthenticated() && 
                       (resource.data.hostId == request.auth.uid ||
                        resource.data.guestId == request.auth.uid);
      
      // No delete allowed (for booking history)
      allow delete: if false;
    }
  }
}
```

## What the Bookings Rules Do:

1. **Read**: Users can read bookings where they are the guest (`guestId`) or host (`hostId`)
2. **Create**: Guests can create bookings where:
   - They are authenticated
   - The `guestId` matches their UID
   - Required fields are present: `guestId`, `hostId`, `listingId`, `checkIn`, `checkOut`
   - The `status` is set to `"pending"` (initial status)
3. **Update**: Both hosts and guests can update bookings they're associated with
4. **Delete**: Not allowed (for booking history)

## Verification Checklist:

After updating the rules:

- [ ] Rules are published in Firebase Console
- [ ] Waited 1-2 minutes for rules to propagate
- [ ] Cleared browser cache
- [ ] User is authenticated (logged in as guest)
- [ ] Tested creating a booking
- [ ] Verified booking is created in Firestore
- [ ] Checked browser console for errors

## Testing:

1. **Log in** as a guest
2. **Go to a listing** detail page
3. **Fill in booking form** (check-in, check-out, guests)
4. **Click "Book Now"** button
5. **Verify** booking is created successfully
6. **Check Firestore** to verify booking document is created

## Troubleshooting:

### Error: "Missing or insufficient permissions"

**Possible causes:**
1. Rules not published - Make sure you clicked "Publish"
2. Rules not propagated - Wait 1-2 minutes after publishing
3. User not authenticated - Make sure user is logged in
4. guestId doesn't match - Verify `request.resource.data.guestId == request.auth.uid`
5. Missing required fields - Check that all required fields are present
6. Browser cache - Clear cache and reload

**Fix:**
1. Go to Firebase Console → Firestore Database → Rules
2. Verify bookings collection rules are present
3. Verify rules are correct (see above)
4. Click "Publish" if not already published
5. Wait 1-2 minutes
6. Clear browser cache
7. Try again

### Error: "guestId doesn't match authenticated user"

**Possible causes:**
1. The `guestId` in the booking data doesn't match the authenticated user's UID
2. The user is not logged in

**Fix:**
1. Verify user is logged in
2. Check that `bookingData.guestId` matches `auth.currentUser.uid`
3. Check the `createBooking` function in `Config.js`

### Error: "Required fields missing"

**Possible causes:**
1. Missing `guestId`, `hostId`, `listingId`, `checkIn`, `checkOut`, or `status`
2. Fields are null or undefined

**Fix:**
1. Check that all required fields are present in the booking data
2. Verify `status` is set to `"pending"`
3. Check the `createBooking` function in `Config.js`

## Important Notes:

- **Guests can create bookings**: Any authenticated user can create a booking as a guest
- **Required fields**: `guestId`, `hostId`, `listingId`, `checkIn`, `checkOut`, `status` are required
- **Initial status**: Bookings must be created with `status == "pending"`
- **Read access**: Both guests and hosts can read their bookings
- **Update access**: Both guests and hosts can update bookings they're associated with
- **No delete**: Bookings cannot be deleted (for booking history)

## Quick Reference:

### Bookings Create Rule:
```javascript
allow create: if isAuthenticated() && 
                 request.resource.data.guestId == request.auth.uid &&
                 request.resource.data.guestId != null &&
                 request.resource.data.hostId != null &&
                 request.resource.data.listingId != null &&
                 request.resource.data.checkIn != null &&
                 request.resource.data.checkOut != null &&
                 request.resource.data.status == "pending";
```

### Bookings Read Rule:
```javascript
allow read: if isAuthenticated() && 
               (resource.data.guestId == request.auth.uid ||
                resource.data.hostId == request.auth.uid);
```

### Bookings Update Rule:
```javascript
allow update: if isAuthenticated() && 
                 (resource.data.hostId == request.auth.uid ||
                  resource.data.guestId == request.auth.uid);
```

## Support:

If you continue to have issues:
1. Check Firebase Console → Firestore Database → Rules for syntax errors
2. Check browser console for specific error messages
3. Verify authentication status
4. Test with a different user account
5. Verify booking data structure matches the rules
6. Contact Firebase support if needed

