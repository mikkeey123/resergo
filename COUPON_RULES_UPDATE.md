# Firestore Security Rules Update for Coupons

## Quick Update Instructions:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rgdatabase-10798`
3. Navigate to **Firestore Database** > **Rules**
4. Add the following rules to your existing rules file (before the closing braces):

```javascript
    // Coupons collection - for host discount coupons
    match /coupons/{couponId} {
      // Anyone authenticated can read coupons (for validation by guests)
      allow read: if isAuthenticated();
      
      // Only hosts can create their own coupons
      allow create: if isAuthenticated() && 
                       request.resource.data.hostId == request.auth.uid;
      
      // Only hosts can update their own coupons
      allow update: if isAuthenticated() && 
                       resource.data.hostId == request.auth.uid &&
                       request.resource.data.hostId == request.auth.uid;
      
      // Only hosts can delete their own coupons
      allow delete: if isAuthenticated() && 
                       resource.data.hostId == request.auth.uid;
    }
```

5. Click **Publish** to save the rules

## What These Rules Do:

- **Coupons Read**: Authenticated users (both hosts and guests) can read coupons for validation
- **Coupons Create**: Only hosts can create coupons, and the hostId must match their UID
- **Coupons Update**: Only hosts can update their own coupons
- **Coupons Delete**: Only hosts can delete their own coupons

## Testing:

After updating the rules:
1. Try creating a coupon as a host
2. Try viewing coupons as a host
3. Try applying a coupon code as a guest
4. All operations should work without permission errors.

