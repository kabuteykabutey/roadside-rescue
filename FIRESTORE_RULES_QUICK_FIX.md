# Quick Fix: Update Firestore Rules NOW

## The Problem
You're getting `permission-denied` because Firestore rules are blocking updates.

## The Solution (2 minutes)

### Step 1: Open Firebase Console
Click this link: https://console.firebase.google.com/

### Step 2: Navigate to Rules
1. Select your project (should be visible on the dashboard)
2. Click **"Firestore Database"** in the left sidebar
3. Click the **"Rules"** tab at the top

### Step 3: Replace ALL the rules with this:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /mechanics/{mechanicId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Publish
Click the **"Publish"** button (top right)

### Step 5: Verify
- You should see a green "Published" status
- The timestamp should be recent (just now)

### Step 6: Test
- Go back to your app
- Try updating your profile again
- It should work now!

## Still Not Working?

If it still doesn't work after publishing:

1. **Hard refresh your browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check you're logged in**: Look for your profile icon in the top right
3. **Try logging out and back in**: This refreshes your auth token
4. **Share the console logs**: Look for lines starting with `[Profile Update]`

## Alternative: Temporary Open Rules (Testing Only)

If you just want to test quickly, you can use these VERY PERMISSIVE rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING**: These rules allow ANYONE to read/write ANYTHING. Only use for testing, then switch back to the secure rules above!
