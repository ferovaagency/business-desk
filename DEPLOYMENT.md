# Firebase App Hosting Deployment Instructions

## Prerequisites
- Node.js 18+ installed
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project: `business-desk-498601`

## Step 1: Authenticate with Firebase
```bash
firebase login
```
This will open a browser window for Google authentication.

## Step 2: Configure Firebase Secrets
Set the required secrets for the backend to work in production:

```bash
firebase apphosting:secrets:set GEMINI_API_KEY --project business-desk-498601
firebase apphosting:secrets:set FIREBASE_ADMIN_CLIENT_EMAIL --project business-desk-498601
firebase apphosting:secrets:set FIREBASE_ADMIN_PRIVATE_KEY --project business-desk-498601
```

When prompted, paste the values from your `.env.local` file.

## Step 3: Deploy to Firebase App Hosting
```bash
firebase apphosting:deploy --project business-desk-498601
```

This will:
- Build the Next.js application
- Deploy to Firebase App Hosting
- Configure the secrets
- Provide the public URL

## Alternative: Firebase Functions + Hosting (if App Hosting is not available)

If Firebase App Hosting is not available in your region, use Firebase Functions with Next.js:

### 1. Install required dependencies
```bash
npm install firebase-functions firebase-admin
```

### 2. Set environment variables in Firebase Console
Go to Firebase Console → Functions → Runtime config and set:
- `GEMINI_API_KEY`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Deploy
```bash
firebase deploy --project business-desk-498601
```

## Post-Deployment Steps
1. Test the landing page at the provided URL
2. Test Google Auth login
3. Test the dashboard at `/dashboard`
4. Test file upload and Gemini analysis with promo code `MAFE_DEV_2026`
5. Test PayPal payment flow

## Production URLs
After deployment, you will receive a URL like:
- `https://business-desk-498601.web.app`
- `https://business-desk-498601.firebaseapp.com`

## Environment Variables Reference
Copy these from your `.env.local` file:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FIREBASE_ADMIN_CLIENT_EMAIL`: Firebase admin service account email
- `FIREBASE_ADMIN_PRIVATE_KEY`: Firebase admin private key (full key with newlines)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID
