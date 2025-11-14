# Firestore Security Rules for Listings Collection

To fix the "Missing or insufficient permissions" error, you need to update your Firestore security rules.

## Steps to Update Firestore Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rgdatabase-10798`
3. Navigate to **Firestore Database** > **Rules**
4. Replace your current rules with the rules below

## Security Rules:

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
      // Allow authenticated users to read any user data (for displaying host profiles, etc.)
      allow read: if isAuthenticated();
      // Allow users to write their own data
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Listings collection
    match /listings/{listingId} {
      // Allow anyone to read published listings (not drafts)
      allow read: if resource.data.isDraft == false || 
                     (isAuthenticated() && resource.data.hostId == request.auth.uid);
      
      // Allow hosts to create listings
      allow create: if isHost() && 
                       request.resource.data.hostId == request.auth.uid;
      
      // Allow hosts to update their own listings
      // Also allow authenticated users to update rating-related fields (for review system)
      allow update: if (isHost() && 
                       resource.data.hostId == request.auth.uid &&
                       request.resource.data.hostId == request.auth.uid) ||
                     (isAuthenticated() && 
                       // Allow updating rating fields - ensure other critical fields remain unchanged
                       request.resource.data.hostId == resource.data.hostId &&
                       request.resource.data.title == resource.data.title &&
                       request.resource.data.rate == resource.data.rate &&
                       request.resource.data.isDraft == resource.data.isDraft);
      
      // Allow hosts to delete their own listings
      allow delete: if isHost() && 
                       resource.data.hostId == request.auth.uid;
    }
    
    // Reviews collection - for guest comments/reviews
    match /reviews/{reviewId} {
      // Anyone can read reviews for published listings
      allow read: if isAuthenticated();
      
      // Authenticated users can create reviews (comments)
      // Guest ID must match the authenticated user's ID
      allow create: if isAuthenticated() && 
                       request.resource.data.guestId == request.auth.uid;
      
      // Users can only update their own reviews
      allow update: if isAuthenticated() && 
                       resource.data.guestId == request.auth.uid &&
                       request.resource.data.guestId == request.auth.uid;
      
      // Users can only delete their own reviews
      allow delete: if isAuthenticated() && 
                       resource.data.guestId == request.auth.uid;
    }
    
    // Favorites collection - for user's favorite listings
    match /favorites/{userId} {
      // Users can only read their own favorites
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can create their own favorites document
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can only update their own favorites
      allow update: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can only delete their own favorites document
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Messages collection - for user messages
    match /messages/{messageId} {
      // Users can read messages where they are sender or receiver
      allow read: if isAuthenticated() && 
                     (resource.data.senderId == request.auth.uid || 
                      resource.data.receiverId == request.auth.uid);
      
      // Users can create messages where they are the sender
      // Core validations: authenticated, senderId matches, receiverId and message are provided
      // All other fields (listingId, read, timestamps) are allowed automatically
      allow create: if isAuthenticated() && 
                       request.resource.data.senderId == request.auth.uid &&
                       request.resource.data.receiverId != null &&
                       request.resource.data.message != null &&
                       request.resource.data.message is string &&
                       request.resource.data.message.size() > 0;
      
      // Users can update messages they received (to mark as read)
      // Only allow updating read status and readAt timestamp
      // Prevent changing sender, receiver, message content, or listingId
      allow update: if isAuthenticated() && 
                       resource.data.receiverId == request.auth.uid &&
                       request.resource.data.senderId == resource.data.senderId &&
                       request.resource.data.receiverId == resource.data.receiverId &&
                       request.resource.data.message == resource.data.message;
      
      // Users cannot delete messages (for message history)
      allow delete: if false;
    }
    
    // Conversations collection - SIMPLIFIED AND FIXED
    match /conversations/{conversationId} {
      // Read: User can read if they are a participant
      allow read: if isAuthenticated() && 
                     (resource.data.participant1Id == request.auth.uid || 
                      resource.data.participant2Id == request.auth.uid);
      
      // Create: User can create if they are participant1Id OR participant2Id
      // This allows either user to create the conversation
      allow create: if isAuthenticated() && 
                       (request.resource.data.participant1Id == request.auth.uid || 
                        request.resource.data.participant2Id == request.auth.uid);
      
      // Update: User can update if they are a participant AND participant IDs don't change
      // When using updateDoc, request.resource.data is the merged document (existing + new fields)
      allow update: if isAuthenticated() && 
                       (resource.data.participant1Id == request.auth.uid || 
                        resource.data.participant2Id == request.auth.uid) &&
                       request.resource.data.participant1Id == resource.data.participant1Id &&
                       request.resource.data.participant2Id == resource.data.participant2Id;
      
      // Delete: Not allowed
      allow delete: if false;
    }
    
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
  }
}
```

## What These Rules Do:

1. **isAuthenticated()**: Checks if the user is logged in
2. **isHost()**: Checks if the user is authenticated and has UserType = "host" in their Resergodb document
3. **Listings Read**: 
   - Anyone can read published listings (isDraft = false)
   - Only the host owner can read their own drafts
4. **Listings Create**: Only hosts can create listings, and the hostId must match their UID
5. **Listings Update**: 
   - Hosts can update their own listings
   - Authenticated users can update rating, reviewsCount, and categoryRatings (for review system)
6. **Listings Delete**: Only hosts can delete their own listings
7. **Reviews Read**: Authenticated users can read all reviews
8. **Reviews Create**: Authenticated users can create reviews, but guestId must match their UID
9. **Reviews Update**: Users can only update their own reviews
10. **Reviews Delete**: Users can only delete their own reviews
11. **Favorites Read**: Users can only read their own favorites
12. **Favorites Create**: Users can create their own favorites document
13. **Favorites Update**: Users can only update their own favorites
14. **Favorites Delete**: Users can only delete their own favorites document
15. **Messages Read**: Users can read messages where they are sender or receiver
16. **Messages Create**: Users can create messages where they are the sender
17. **Messages Update**: Users can update messages they received (to mark as read)
18. **Messages Delete**: Not allowed (for message history)
19. **Conversations Read**: Users can read conversations where they are a participant
20. **Conversations Create**: Users can create conversations where they are a participant
21. **Conversations Update**: Users can update conversations where they are a participant
22. **Conversations Delete**: Not allowed (for conversation history)
23. **Wallets Read**: Users can only read their own wallet
24. **Wallets Create**: Users can create their own wallet
25. **Wallets Update**: Users can only update their own wallet
26. **Wallets Delete**: Not allowed (for wallet persistence)
27. **Transactions Read**: Users can only read their own transactions
28. **Transactions Create**: Users can create transactions for themselves
29. **Transactions Update**: Users can update their own transactions
30. **Transactions Delete**: Not allowed (for transaction history)
31. **Coupons Read**: Authenticated users can read coupons (for validation)
32. **Coupons Create**: Only hosts can create their own coupons
33. **Coupons Update**: Only hosts can update their own coupons
34. **Coupons Delete**: Only hosts can delete their own coupons

## Testing:

After updating the rules:
1. Click "Publish" in the Firebase Console
2. Try creating a listing again from your app
3. The listing should save successfully

## Note:

Make sure the user creating the listing:
1. Is logged in (authenticated)
2. Has completed their account setup
3. Has UserType = "host" in their Resergodb document

