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
      // Allow users to read their own data
      allow read: if isAuthenticated() && request.auth.uid == userId;
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
      allow update: if isHost() && 
                       resource.data.hostId == request.auth.uid &&
                       request.resource.data.hostId == request.auth.uid;
      
      // Allow hosts to delete their own listings
      allow delete: if isHost() && 
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
5. **Listings Update**: Only hosts can update their own listings
6. **Listings Delete**: Only hosts can delete their own listings

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

