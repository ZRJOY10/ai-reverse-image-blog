# AI Reverse Image Blog - Setup Instructions

## Step 1: Configure Firebase Security Rules

1. Go to your Firebase Console: https://console.firebase.google.com
2. Select your project
3. Click on "Firestore Database" in the left sidebar
4. Click on the "Rules" tab at the top
5. Replace the existing rules with the following:

```rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Blogs collection - anyone can read, only authenticated users can write
    match /blogs/{blogId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      // Comments subcollection - anyone can read and write
      match /comments/{commentId} {
        allow read: if true;
        allow create: if true;
        allow update, delete: if request.auth != null;
      }
    }
  }
}
