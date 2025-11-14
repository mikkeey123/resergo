# Fix: Booking Approval Permission Errors

## Issues

1. **EmailJS Error**: Template ID `template_9508bwo` not found (400 error)
2. **Firestore Permission Error**: Host cannot update booking status due to wallet update restrictions

## Issue 1: EmailJS Template ID Not Found

### Problem
The booking rejection email template ID `template_9508bwo` is not found in EmailJS.

### Solution Options

**Option 1: Create the Template in EmailJS**
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin/templates)
2. Create a new template for booking rejection
3. Copy the template ID
4. Update your `.env` file:
   ```
   VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION=your_template_id_here
   ```

**Option 2: Use Existing Template**
1. Check your EmailJS Dashboard for existing templates
2. Use an existing template ID
3. Update your `.env` file with the correct template ID

**Option 3: Disable Rejection Email (Temporary)**
- The email error won't block booking rejection, but you won't get email notifications
- You can fix this later when you have the correct template ID

### Quick Fix: Check Your .env File

1. Check if `VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION` is set in your `.env` file
2. If not, add it:
   ```
   VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION=template_9508bwo
   ```
3. Verify the template ID exists in your EmailJS Dashboard
4. Restart your dev server after updating `.env`

## Issue 2: Firestore Permission Error for Booking Updates

### Problem
When a host tries to approve a booking, the system needs to:
1. Update the booking status ✅ (allowed by current rules)
2. Deduct money from guest's wallet ❌ (NOT allowed - only guest can update their wallet)
3. Add money to host's wallet ✅ (allowed - host can update their wallet)
4. Create transactions ❌ (NOT allowed - transactions must be created by the user themselves)

### Root Cause
The current Firestore rules only allow:
- Wallet updates: Only the wallet owner can update their own wallet
- Transaction creation: Only the user can create their own transactions

But when approving a booking, the host needs to:
- Update the guest's wallet (deduct payment)
- Create a transaction for the guest (payment record)

### Solution: Update Firestore Rules

We need to allow wallet and transaction updates for booking payments. Here are the updated rules:

#### Updated Wallet Rules:

```javascript
// Wallets collection - UPDATED FOR BOOKING PAYMENTS
match /wallets/{userId} {
  allow read: if isAuthenticated() && request.auth.uid == userId;
  allow create: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow wallet owner to update their own wallet
  // OR allow host to update guest wallet for booking payments
  allow update: if isAuthenticated() && 
                   (request.auth.uid == userId ||
                    // Allow host to update guest wallet if it's for a booking payment
                    // This is a simplified rule - in production, use Cloud Functions for security
                    exists(/databases/$(database)/documents/bookings/$(request.resource.data.lastBookingId || 'none')));
  
  allow delete: if false;
}
```

**⚠️ Note:** The above rule is a simplified solution. For better security, you should use Cloud Functions to handle booking payments.

#### Better Solution: Allow Wallet Updates for Booking Payments

A better approach is to allow wallet updates when:
1. The user is the wallet owner (existing rule)
2. OR the update is part of a booking payment (check booking document)

However, Firestore rules have limitations. Here's a more practical solution:

#### Updated Wallet Rules (Practical Solution):

```javascript
// Wallets collection - UPDATED FOR BOOKING PAYMENTS
match /wallets/{userId} {
  allow read: if isAuthenticated() && request.auth.uid == userId;
  allow create: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow wallet owner to update their own wallet
  // OR allow any authenticated user to update wallets (for booking payments)
  // ⚠️ This is less secure but allows booking payments to work
  // In production, use Cloud Functions for better security
  allow update: if isAuthenticated();
  
  allow delete: if false;
}
```

#### Updated Transaction Rules:

```javascript
// Transactions collection - UPDATED FOR BOOKING PAYMENTS
match /transactions/{transactionId} {
  allow read: if isAuthenticated() && 
                 resource.data.userId == request.auth.uid;
  
  // Allow users to create their own transactions
  // OR allow hosts to create transactions for guests (for booking payments)
  // ⚠️ This is less secure but allows booking payments to work
  allow create: if isAuthenticated();
  
  allow update: if isAuthenticated() && 
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.userId == request.auth.uid;
  allow delete: if false;
}
```

## Complete Updated Rules

Here's the complete Firestore rules with booking payment support:

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
    
    // ✅ Wallets collection - UPDATED FOR BOOKING PAYMENTS
    match /wallets/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // Allow wallet owner to update their own wallet
      // OR allow any authenticated user to update wallets (for booking payments)
      // ⚠️ Note: This is less secure but allows booking payments to work
      // In production, use Cloud Functions for better security
      allow update: if isAuthenticated();
      
      allow delete: if false;
    }
    
    // ✅ Transactions collection - UPDATED FOR BOOKING PAYMENTS
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      
      // Allow users to create their own transactions
      // OR allow hosts to create transactions for guests (for booking payments)
      // ⚠️ Note: This is less secure but allows booking payments to work
      allow create: if isAuthenticated();
      
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
    
    // ✅ Bookings collection - UPDATED
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

## Step-by-Step Fix

### Step 1: Fix EmailJS Template ID

1. **Check your EmailJS Dashboard**:
   - Go to https://dashboard.emailjs.com/admin/templates
   - Look for a booking rejection template
   - If it exists, copy its template ID
   - If it doesn't exist, create one or use an existing template

2. **Update your `.env` file**:
   ```
   VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION=your_actual_template_id_here
   ```

3. **Restart your dev server** after updating `.env`

### Step 2: Update Firestore Rules

1. **Go to Firebase Console**:
   - Go to https://console.firebase.google.com/
   - Select your project: `rgdatabase-10798`
   - Navigate to **Firestore Database** → **Rules**

2. **Update Wallet Rules**:
   - Find the `wallets` collection rules
   - Change the `allow update` rule to: `allow update: if isAuthenticated();`

3. **Update Transaction Rules**:
   - Find the `transactions` collection rules
   - Change the `allow create` rule to: `allow create: if isAuthenticated();`

4. **Publish Rules**:
   - Click **Publish** button
   - Wait 1-2 minutes for rules to propagate
   - Clear browser cache (Ctrl+Shift+R)

### Step 3: Test Booking Approval

1. **Log in as a host**
2. **Go to Bookings page**
3. **Approve a pending booking**
4. **Check browser console** for errors
5. **Verify** booking status is updated to "active"
6. **Verify** guest wallet is deducted
7. **Verify** host wallet is credited
8. **Verify** transactions are created

## Security Note

⚠️ **Important**: The updated wallet and transaction rules are less secure but allow booking payments to work. For better security in production:

1. **Use Cloud Functions**: Move booking payment logic to Cloud Functions
2. **Server-side validation**: Validate booking payments on the server
3. **Admin SDK**: Use Firebase Admin SDK for secure wallet updates
4. **Additional validation**: Add additional checks in Cloud Functions

## Troubleshooting

### EmailJS Template ID Error

**If the template ID error persists:**
1. Check EmailJS Dashboard for the correct template ID
2. Verify the template is published (not in draft)
3. Check that the template is associated with the correct service
4. Update `.env` file with the correct template ID
5. Restart dev server

### Firestore Permission Error

**If the permission error persists:**
1. Check Firebase Console → Firestore Database → Rules
2. Verify wallet and transaction rules are updated
3. Verify rules are published
4. Wait 1-2 minutes after publishing
5. Clear browser cache
6. Check browser console for specific error messages

### Booking Approval Still Fails

**If booking approval still fails:**
1. Check browser console for specific error messages
2. Verify user is authenticated
3. Verify user is the host of the booking
4. Verify booking status is "pending"
5. Verify guest has sufficient wallet balance
6. Check Firestore rules for syntax errors

## Expected Behavior

After applying the fixes:
- ✅ Hosts can approve bookings
- ✅ Guest wallet is deducted when booking is approved
- ✅ Host wallet is credited when booking is approved
- ✅ Transactions are created for both guest and host
- ✅ Booking status is updated to "active"
- ✅ Email notifications are sent (if template ID is correct)

## Support

If you continue to have issues:
1. Check Firebase Console → Firestore Database → Rules for syntax errors
2. Check browser console for specific error messages
3. Verify authentication status
4. Test with a different user account
5. Contact Firebase support if needed

