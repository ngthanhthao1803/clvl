# System Architecture

## Goals

- Match badminton players by city, district, schedule, and skill level
- Support session creation, joining, chat, notifications, ratings, and venue discovery
- Keep the API modular enough to scale from a startup MVP to a larger community platform

## High-Level Flow

1. User signs in with Google through Firebase Authentication.
2. Frontend receives the Firebase user and obtains a Firebase ID token.
3. Frontend exchanges that token with the backend.
4. Backend verifies the Firebase token, creates or updates the local user record, and issues a JWT.
5. Frontend persists the JWT and uses it for protected API calls and Socket.IO handshakes.
6. Users create or join badminton sessions, chat in real time, and receive notifications.

## Backend Layers

- Routes: request entry points
- Controllers: HTTP orchestration and response formatting
- Services: business logic and transaction boundaries
- Models: Mongoose schemas and indexes
- Middlewares: auth, validation, error handling, request shaping
- Utils: reusable helpers such as JWT signing, async wrappers, and socket event names

## Frontend Layers

- App Router pages for public and protected screens
- Component system for cards, forms, chat, and navigation
- Zustand store for auth state and lightweight UI state
- TanStack Query for server state and caching
- Socket.IO client for realtime session chat and presence

## Data Domains

- Users: player profile, skill, schedule, reputation
- Sessions: matchmaking, attendance, status, pricing, host ownership
- Venues: courts, districts, hours, images, ratings
- Messages: session chat history
- Notifications: system events and unread state
- Ratings: post-session reputation and anti-spam controls
