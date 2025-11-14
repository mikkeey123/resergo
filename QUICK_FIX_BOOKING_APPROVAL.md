# Quick Fix: Booking Approval Permission Errors

## Issues

1. **EmailJS Error**: Template ID `template_9508bwo` not found (400 error) - This won't block booking rejection, but emails won't be sent
2. **Firestore Permission Error**: Host cannot update booking status due to wallet/transaction restrictions

## Quick Fix Steps

### Step 1: Update Firestore Rules (REQUIRED)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rgdatabase-10798`
3. Navigate to **Firestore Database** → **Rules**

4. **Find the `wallets` collection rules** and update:
   ```javascript
   // Wallets collection - UPDATED FOR BOOKING PAYMENTS
   match /wallets/{userId} {
     allow read: if isAuthenticated() && request.auth.uid == userId;
     allow create: if isAuthenticated() && request.auth.uid == userId;
     
     // ✅ CHANGE THIS LINE:
     // FROM: allow update: if isAuthenticated() && request.auth.uid == userId;
     // TO:
     allow update: if isAuthenticated();
     
     allow delete: if false;
   }
   ```

5. **Find the `transactions` collection rules** and update:
   ```javascript
   // Transactions collection - UPDATED FOR BOOKING PAYMENTS
   match /transactions/{transactionId} {
     allow read: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
     
     // ✅ CHANGE THIS LINE:
     // FROM: allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
     // TO:
     allow create: if isAuthenticated();
     
     allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid &&
                      request.resource.data.userId == request.auth.uid;
     allow delete: if false;
   }
   ```

6. **Click "Publish"** button
7. **Wait 1-2 minutes** for rules to propagate
8. **Clear browser cache** (Ctrl+Shift+R)

### Step 2: Fix EmailJS Template ID (OPTIONAL - Won't block booking)

1. **Check your EmailJS Dashboard**:
   - Go to https://dashboard.emailjs.com/admin/templates
   - Look for a booking rejection template
   - If it exists, copy its template ID
   - If it doesn't exist, you can create one or skip for now

2. **Update your `.env` file**:
   ```
   VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION=your_actual_template_id_here
   ```

3. **Restart your dev server** after updating `.env`

**Note**: If you don't have the template ID, booking rejection will still work, but no email will be sent. You can fix this later.

## What Changed

### Wallet Rules:
- **Before**: Only wallet owner can update their wallet
- **After**: Any authenticated user can update wallets (for booking payments)

### Transaction Rules:
- **Before**: Only user can create their own transactions
- **After**: Any authenticated user can create transactions (for booking payments)

## Security Note

⚠️ **Important**: These updated rules are less secure but allow booking payments to work. For better security in production:
- Use Cloud Functions for booking payments
- Use Firebase Admin SDK for secure wallet updates
- Add additional server-side validation

## Testing

After updating the rules:
1. Log in as a host
2. Go to Bookings page
3. Approve a pending booking
4. Check browser console for errors
5. Verify booking status is updated to "active"
6. Verify guest wallet is deducted
7. Verify host wallet is credited
8. Verify transactions are created

## Troubleshooting

### If booking approval still fails:

1. **Check Firebase Console** → Firestore Database → Rules
   - Verify wallet rules are updated
   - Verify transaction rules are updated
   - Verify rules are published

2. **Wait for propagation**:
   - Rules may take 1-2 minutes to propagate
   - Wait at least 2 minutes after publishing

3. **Clear browser cache**:
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Check browser console**:
   - Look for specific error messages
   - Verify user is authenticated
   - Verify user is the host of the booking

5. **Verify booking status**:
   - Booking must be in "pending" status
   - Guest must have sufficient wallet balance

### If EmailJS error persists:

1. **Check EmailJS Dashboard**:
   - Verify template exists
   - Verify template is published (not in draft)
   - Verify template is associated with the correct service

2. **Update `.env` file**:
   - Set `VITE_EMAILJS_TEMPLATE_ID_BOOKING_REJECTION` to the correct template ID
   - Restart dev server

3. **Note**: Email errors won't block booking rejection - they're just logged as warnings

## Expected Behavior

After applying the fixes:
- ✅ Hosts can approve bookings
- ✅ Guest wallet is deducted when booking is approved
- ✅ Host wallet is credited when booking is approved
- ✅ Transactions are created for both guest and host
- ✅ Booking status is updated to "active"
- ⚠️ Email notifications may not work (if template ID is incorrect)

## Complete Updated Rules

See `FIRESTORE_RULES_COMPLETE.md` for the complete updated rules file.

## Support

If you continue to have issues:
1. Check Firebase Console → Firestore Database → Rules for syntax errors
2. Check browser console for specific error messages
3. Verify authentication status
4. Test with a different user account
5. Contact Firebase support if needed

