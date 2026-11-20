# Community Engagement Platform – MVP

A practical foundation for the community communication & engagement app described in the original specification.

## What’s included

| Layer | Status | Location |
|-------|--------|----------|
| **PostgreSQL schema** | Complete (users, communities, groups, memberships, posts, comments, reactions, events + RSVP, polls, notifications, documents, reports, audit logs, soft deletes, indexes) | `db/migrations/001_init_schema.sql` |
| **NestJS Backend** | Auth (JWT), Users, Communities, Posts (with official/pinned role checks), Events + RSVP | `backend/` |
| **Next.js Frontend** | Landing, Register, Login, Dashboard (community list, feed, create post, events) | `frontend/` |
| **Mobile** | Not implemented yet – see notes below | – |

## Quick start

### 1. Database
```bash
# Using local Postgres or Docker
createdb community_app
psql -d community_app -f db/migrations/001_init_schema.sql
```

### 2. Backend
```bash
cd backend
npm install
# create .env with DB_* and JWT_SECRET (see backend/README.md)
npm run start:dev
# → http://localhost:3001
```

### 3. Frontend
```bash
cd frontend
npm install
# optional: NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
# → http://localhost:3000
```

## Image support (new)

- Upload avatars, community logos/covers, and post images via `POST /uploads/:category`
- Dashboard shows real user avatars, community logos & covers, and post photos
- Demo stock images (Unsplash) are included under `backend/uploads/`
- Files are served statically from `/uploads/...`

## Core flows that work today
1. Register / Login → JWT stored in localStorage
2. Create a community (via `POST /communities` or extend the UI)
3. List my communities on the dashboard
4. Post to a community feed (members can post; only admin/mod/owner can set `isOfficial` / `isPinned`)
5. Create events and RSVP

## Mobile-first path (React Native / Expo)
Because you requested mobile-first:
- The API is already mobile-ready (REST + JWT).
- Recommended next step: create an Expo (React Native) app that reuses the same `lib/api` patterns.
- Key screens to port first: Auth → Community list → Feed → Event detail + RSVP.
- You can keep the Next.js web app for admin / desktop use.

## Extending the MVP
The SQL schema already contains tables for:
- Groups & group memberships
- Comments & reactions
- Polls & votes
- Notifications + preferences
- Documents
- Reports & moderation actions
- Audit logs

Add corresponding NestJS modules and frontend screens as needed.

## Security notes for production
- Change `JWT_SECRET`
- Use strong password hashing (already bcrypt)
- Enable HTTPS
- Add rate limiting
- Validate file uploads if you add media
- Consider row-level security or more granular permission checks

---

Built according to the detailed community platform specification (roles, official announcements, events + RSVP, soft deletes, etc.).
