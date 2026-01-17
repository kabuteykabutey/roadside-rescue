# Firestore Security Rules Setup Guide

## Problem
You're getting "Missing or insufficient permissions" error when trying to update profiles because Firestore security rules are blocking the update operation.

## Solution
You need to update your Firestore security rules to allow authenticated users to update their own profiles.

## Option 1: Update Rules via Firebase Console (Quickest)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `roadside-rescue` (or your project name)
3. **Navigate to Firestore Database**:
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top
4. **Replace the existing rules** with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Profiles collection - users can read all profiles but only update their own
    match /profiles/{userId} {
      allow read: if true; // Anyone can read profiles
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Mechanics collection - users can read all mechanics
    match /mechanics/{mechanicId} {
      allow read: if true; // Anyone can read mechanics
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. **Click "Publish"** to deploy the rules

## Option 2: Deploy Rules via Firebase CLI

If you have Firebase CLI installed and initialized:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your project
   - Accept the default `firestore.rules` file

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## What These Rules Do

- **Profiles Collection**:
  - ✅ Anyone can READ all profiles (for displaying mechanic profiles, etc.)
  - ✅ Authenticated users can CREATE their own profile
  - ✅ Authenticated users can UPDATE only their own profile
  - ✅ Authenticated users can DELETE only their own profile

- **Mechanics Collection**:
  - ✅ Anyone can READ all mechanics
  - ✅ Authenticated users can CREATE mechanic entries
  - ✅ Only the owner can UPDATE their mechanic entry
  - ✅ Only the owner can DELETE their mechanic entry

- **All Other Collections**:
  - ❌ Denied by default (you'll need to add specific rules as you add more collections)

## Testing

After updating the rules:
1. Refresh your application
2. Try to edit your profile again
3. The update should now work without permission errors

## Security Notes

⚠️ **Important**: These rules allow public read access to profiles and mechanics. This is intentional for a marketplace/directory app, but make sure you:
- Don't store sensitive data in these collections
- Add more restrictive rules for other collections (orders, payments, etc.)
- Consider adding rate limiting for production
