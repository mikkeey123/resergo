# Firestore Security Rules - Delete Conversation Fix

## Issue: Missing or insufficient permissions when deleting conversations

The Firestore security rules need to be updated to allow users to delete conversations and messages they're part of.

## Steps to Update Firestore Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rgdatabase-10798`
3. Navigate to **Firestore Database** > **Rules**
4. Update the rules for `conversations` and `messages` collections to allow deletion

## Security Rules Update:

Add delete permissions to the existing rules for conversations and messages:

### For Conversations Collection:

```javascript
// Conversations collection
match /conversations/{conversationId} {
  // Users can read conversations where they are a participant
  allow read: if isAuthenticated() && 
                 (resource.data.participant1Id == request.auth.uid ||
                  resource.data.participant2Id == request.auth.uid);
  
  // Users can create conversations where they are a participant
  allow create: if isAuthenticated() && 
                   (request.resource.data.participant1Id == request.auth.uid ||
                    request.resource.data.participant2Id == request.auth.uid);
  
  // Users can update conversations where they are a participant
  allow update: if isAuthenticated() && 
                   (resource.data.participant1Id == request.auth.uid ||
                    resource.data.participant2Id == request.auth.uid);
  
  // ✅ ADD THIS: Users can delete conversations where they are a participant
  allow delete: if isAuthenticated() && 
                   (resource.data.participant1Id == request.auth.uid ||
                    resource.data.participant2Id == request.auth.uid);
}
```

### For Messages Collection:

```javascript
// Messages collection
match /messages/{messageId} {
  // Users can read messages where they are sender or receiver
  allow read: if isAuthenticated() && 
                 (resource.data.senderId == request.auth.uid ||
                  resource.data.receiverId == request.auth.uid);
  
  // Users can create messages where they are the sender
  allow create: if isAuthenticated() && 
                   request.resource.data.senderId == request.auth.uid;
  
  // Users can update messages they received (to mark as read)
  allow update: if isAuthenticated() && 
                   resource.data.receiverId == request.auth.uid &&
                   request.resource.data.receiverId == request.auth.uid;
  
  // ✅ ADD THIS: Users can delete messages where they are sender or receiver
  allow delete: if isAuthenticated() && 
                   (resource.data.senderId == request.auth.uid ||
                    resource.data.receiverId == request.auth.uid);
}
```

## Complete Updated Rules:

Here's the complete rules file with delete permissions added:

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
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Messages collection - UPDATED WITH DELETE PERMISSION
    match /messages/{messageId} {
      // Users can read messages where they are sender or receiver
      allow read: if isAuthenticated() && 
                     (resource.data.senderId == request.auth.uid ||
                      resource.data.receiverId == request.auth.uid);
      
      // Users can create messages where they are the sender
      allow create: if isAuthenticated() && 
                       request.resource.data.senderId == request.auth.uid;
      
      // Users can update messages they received (to mark as read)
      allow update: if isAuthenticated() && 
                       resource.data.receiverId == request.auth.uid &&
                       request.resource.data.receiverId == request.auth.uid;
      
      // ✅ Users can delete messages where they are sender or receiver
      allow delete: if isAuthenticated() && 
                       (resource.data.senderId == request.auth.uid ||
                        resource.data.receiverId == request.auth.uid);
    }
    
    // Conversations collection - UPDATED WITH DELETE PERMISSION
    match /conversations/{conversationId} {
      // Users can read conversations where they are a participant
      allow read: if isAuthenticated() && 
                     (resource.data.participant1Id == request.auth.uid ||
                      resource.data.participant2Id == request.auth.uid);
      
      // Users can create conversations where they are a participant
      allow create: if isAuthenticated() && 
                       (request.resource.data.participant1Id == request.auth.uid ||
                        request.resource.data.participant2Id == request.auth.uid);
      
      // Users can update conversations where they are a participant
      allow update: if isAuthenticated() && 
                       (resource.data.participant1Id == request.auth.uid ||
                        resource.data.participant2Id == request.auth.uid);
      
      // ✅ Users can delete conversations where they are a participant
      allow delete: if isAuthenticated() && 
                       (resource.data.participant1Id == request.auth.uid ||
                        resource.data.participant2Id == request.auth.uid);
    }
    
    // Wallets collection
    match /wallets/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
    }
    
    // Coupons collection
    match /coupons/{couponId} {
      allow read: if isAuthenticated();
      allow create: if isHost() && 
                       request.resource.data.hostId == request.auth.uid;
      allow update: if isHost() && 
                       resource.data.hostId == request.auth.uid;
      allow delete: if isHost() && 
                       resource.data.hostId == request.auth.uid;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && 
                     (resource.data.guestId == request.auth.uid ||
                      resource.data.hostId == request.auth.uid);
      allow create: if isAuthenticated() && 
                       request.resource.data.guestId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       (resource.data.hostId == request.auth.uid ||
                        resource.data.guestId == request.auth.uid);
    }
  }
}
```

## Quick Fix Steps:

1. Go to Firebase Console → Firestore Database → Rules
2. Find the `conversations` collection rules
3. Add the `allow delete` rule as shown above
4. Find the `messages` collection rules
5. Add the `allow delete` rule as shown above
6. Click **Publish** to save the rules

## Verification:

After updating the rules:
1. Try deleting a conversation in the app
2. Check browser console for any errors
3. Verify the conversation is deleted from Firestore
4. Verify messages are deleted from Firestore

## Important Notes:

- **Delete permissions are user-specific**: Users can only delete conversations and messages they're part of
- **Both participants can delete**: Either user in a conversation can delete it, which removes it for both users
- **Messages are also deleted**: When a conversation is deleted, all associated messages are deleted
- **This is permanent**: Deleted conversations and messages cannot be recovered

