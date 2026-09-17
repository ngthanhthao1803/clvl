# CLVL Badminton Platform

Production-ready monorepo scaffold for a badminton social and matchmaking platform for Vietnam.

## Architecture

```text
.
|-- apps/
|   |-- api/                ExpressJS + MongoDB + Socket.IO backend
|   `-- web/                NextJS App Router frontend
|-- docs/
|   `-- architecture.md     System design notes and implementation roadmap
|-- package.json            Workspace scripts
`-- README.md
```

## Stack

- Frontend: NextJS, TailwindCSS, Zustand, TanStack Query, Socket.IO client, Firebase Authentication
- Backend: Node.js, ExpressJS, MongoDB + Mongoose, Socket.IO, JWT, REST API, MVC + service pattern
- Deployment: Vercel for web, Railway or Render for API

## Environment

Backend variables:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Frontend variables:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Run

1. Install dependencies in both workspaces.
2. Copy the environment examples into `.env` and `.env.local` files.
3. Run `npm run dev` from the repo root.

## Roadmap

The scaffold is organized in the same sequence requested by the user:

1. Complete project architecture
2. Backend structure
3. Frontend structure
4. Database models
5. Authentication system
6. APIs
7. UI pages
8. Realtime system
9. Deployment guide
