# Deployment Guide

## Frontend on Vercel

1. Connect the `apps/web` folder as the Vercel project root.
2. Set the `NEXT_PUBLIC_*` Firebase values and `NEXT_PUBLIC_API_URL`.
3. Build command: `npm run build`.
4. Output is handled automatically by NextJS.

## Backend on Railway or Render

1. Connect the `apps/api` folder as the service root.
2. Set `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, and Firebase Admin credentials.
3. Start command: `npm start`.
4. Make sure the service is allowed to receive requests from the deployed Vercel origin.

## MongoDB Atlas

1. Create a cluster and whitelist the backend host.
2. Create a database user with least privilege.
3. Use the Atlas connection string in `MONGODB_URI`.

## Firebase Authentication

1. Create a Firebase web app.
2. Enable Google sign-in.
3. Add the same web config values to the frontend environment.
4. Create a service account for the backend and export `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

## Runtime Notes

- The frontend exchanges the Firebase ID token for the backend JWT.
- The backend JWT is used for protected REST calls and Socket.IO connections.
- Session chat and presence depend on the backend service being reachable.
