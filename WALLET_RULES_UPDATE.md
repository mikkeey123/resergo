# Firestore Security Rules Update for Wallets and Transactions

## Quick Update Instructions:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rgdatabase-10798`
3. Navigate to **Firestore Database** > **Rules**
4. Add the following rules to your existing rules file (before the closing braces):

```javascript
    // Wallets collection - for user e-wallet balances
    match /wallets/{userId} {
      // Users can only read their own wallet
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can create their own wallet
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can only update their own wallet
      allow update: if isAuthenticated() && request.auth.uid == userId;
      
      // Users cannot delete their wallet
      allow delete: if false;
    }
    
    // Transactions collection - for wallet transactions (top-up, withdrawal)
    match /transactions/{transactionId} {
      // Users can only read their own transactions
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      
      // Users can create transactions for themselves
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can update their own transactions (for status updates)
      allow update: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.userId == request.auth.uid;
      
      // Users cannot delete transactions (for transaction history)
      allow delete: if false;
    }
```

5. Click **Publish** to save the rules

## What These Rules Do:

- **Wallets**: Users can only access and modify their own wallet balance
- **Transactions**: Users can only view and create transactions for their own account

## Testing:

After updating the rules:
1. Try accessing the e-wallet page
2. Try topping up your wallet
3. Try withdrawing from your wallet
4. Check transaction history

All operations should work without permission errors.

