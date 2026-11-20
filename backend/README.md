# Community App – NestJS Backend

## Quick start

1. Make sure PostgreSQL is running and the schema is applied (see `../db/README.md`).

2. Install dependencies:

```bash
cd backend
npm install
```

3. Environment variables (create `.env`):

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=community_app
JWT_SECRET=change-this-to-a-long-random-string
PORT=3001
FRONTEND_URL=http://localhost:3000
```

4. Run:

```bash
npm run start:dev
```

API will be available at `http://localhost:3001`.

## Main endpoints

### Auth
- `POST /auth/register` – `{ email, password, firstName?, lastName?, displayName? }`
- `POST /auth/login` – `{ email, password }`

### Users
- `GET /users/me` (Bearer token)
- `PATCH /users/me`

### Communities
- `POST /communities` – create (you become owner)
- `GET /communities` – my communities
- `GET /communities/:slug`
- `POST /communities/:id/join`

### Posts
- `POST /posts` – `{ communityId, body, title?, postType?, isOfficial?, isPinned? }`
  - Only admin/mod/owner can set `isOfficial` or `isPinned`
- `GET /posts?communityId=...`
- `GET /posts/:id`

### Events
- `POST /events` – create event
- `GET /events?communityId=...`
- `POST /events/:id/rsvp` – `{ response: "going" | "maybe" | "not_going" }`
- `GET /events/:id/attendees`

## Notes
- All authenticated routes require `Authorization: Bearer <token>`.
- Role checks for official posts are enforced in the service layer.
- Soft deletes and full schema (polls, notifications, documents, etc.) are already in the SQL migration; you can extend the NestJS modules later.

## Image uploads

- Endpoint: `POST /uploads/:category`  
  Categories: `avatars` | `communities` | `posts` | `events`
- Field name: `file` (multipart/form-data)
- Accepted types: jpeg, png, gif, webp
- Max size: 5 MB
- Requires JWT
- Returns: `{ url, filename, originalName, size, mimetype }`

Uploaded files are stored in `backend/uploads/` and served statically at `/uploads/...`.

Demo images are already present in the uploads folders for testing.

Example with curl:
```bash
curl -X POST http://localhost:3001/uploads/avatars \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@photo.jpg"
```

Then use the returned `url` when updating a user avatar or creating a post.
