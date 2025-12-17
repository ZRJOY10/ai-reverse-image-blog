# Firebase Setup Instructions

To get your blog site working with Firebase, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "AI Reverse Image Blog")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)

## 2. Set Up Firestore Database

1. In your Firebase project, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll add security rules next)
4. Select your Cloud Firestore location (choose closest to your users)
5. Click "Enable"

## 3. Configure Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Copy the contents from the `firestore.rules` file in this project
3. Paste it into the Firebase console
4. Click "Publish"

These rules allow:
- Anyone to read published blogs
- Anyone to create comments
- Only authenticated admins to create/edit/delete blogs
- Only authenticated admins to hide/delete comments

## 4. Enable Email/Password Authentication

1. Go to "Build" > "Authentication"
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

## 5. Create Your Admin User

1. In Authentication, go to the "Users" tab
2. Click "Add user"
3. Enter your email and password
4. Click "Add user"

This will be your admin account to manage the blog.

## 6. Get Your Firebase Configuration

1. Go to Project Settings (gear icon) > "General" tab
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Blog Site")
5. Copy the `firebaseConfig` object values

## 7. Add Environment Variables

The following environment variables are already configured in your v0 project:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Check the "Vars" section in the v0 sidebar and ensure these are filled with your Firebase config values.

## 8. Test Your Setup

1. Try logging in at `/admin/login` with your admin credentials
2. Create a test blog post
3. View it on the homepage
4. Add a comment
5. Try hiding/showing and deleting comments as admin

## Troubleshooting

### "Permission Denied" Error

If you see "Missing or insufficient permissions":
- Make sure you've published the Firestore security rules
- Verify you're logged in when trying to create/edit content
- Check that the rules are correctly configured

### Authentication Not Working

- Verify Email/Password auth is enabled in Firebase Console
- Check that your environment variables are correct
- Make sure you created an admin user in the Authentication tab

### Comments Not Showing

- Check browser console for any errors
- Verify Firestore rules allow comment creation
- Make sure the blog ID is valid

## Support

For more help, check the [Firebase Documentation](https://firebase.google.com/docs).
