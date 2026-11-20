# Database Setup

## Requirements
- PostgreSQL 14+ (recommended 16)
- `uuid-ossp` and `pgcrypto` extensions

## Quick start

```bash
# Create database
createdb community_app

# Run migrations in order
psql -d community_app -f migrations/001_init_schema.sql
psql -d community_app -f migrations/002_add_post_image_url.sql
psql -d community_app -f migrations/004_add_event_image_url.sql
psql -d community_app -f migrations/003_seed_demo_data.sql
```

Or with Docker:

```bash
docker run --name community-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=community_app -p 5432:5432 -d postgres:16
# wait a few seconds, then run the four psql commands above
```

## What the seed provides

After running `003_seed_demo_data.sql` you get:

**Communities with real images**
- Greenfield Residents Association (logo + cover photo)
- Riverside Youth Club (logo + cover photo)

**Posts with real images**
- Official welcome announcement with photo
- Security meeting notice with photo
- Street cleanup photo post
- Youth workshop announcement with photo

**Events with cover images**
- Monthly Security Meeting
- Youth Skills Workshop
- Annual Community Braai

**Demo users** (avatars included)
- sarah@demo.community
- james@demo.community  
- thandi@demo.community

If demo login fails, simply register a new account — the communities, posts and images stay in the database. You can join the public communities from the API or extend the UI.

## Notes
- All primary keys are UUIDs
- Soft deletes via `deleted_at`
- Timestamps stored in UTC
- Image URLs point to `http://localhost:3001/uploads/...` (served by the NestJS backend)
