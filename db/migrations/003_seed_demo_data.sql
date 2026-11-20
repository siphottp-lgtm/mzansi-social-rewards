-- Seed realistic demo data with REAL images on communities and posts
-- Run after 001 and 002 migrations.
--
-- Demo login accounts (password for all: Demo1234!)
--   sarah@demo.community
--   james@demo.community
--   thandi@demo.community
--
-- If the password hash does not match on your system, simply register a new account.
-- The communities and posts with images will still be in the database.

-- =========================================================================
-- 1. DEMO USERS
-- =========================================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, display_name, avatar_url, bio, is_verified, is_active)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    'sarah@demo.community',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- common demo hash
    'Sarah', 'Nkosi', 'Sarah Nkosi',
    'http://localhost:3001/uploads/avatars/demo-avatar-1.jpg',
    'Community organizer and neighborhood champion.',
    TRUE, TRUE
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'james@demo.community',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'James', 'Mokoena', 'James Mokoena',
    'http://localhost:3001/uploads/avatars/demo-avatar-2.jpg',
    'Event coordinator and youth mentor.',
    TRUE, TRUE
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'thandi@demo.community',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Thandi', 'Dlamini', 'Thandi Dlamini',
    'http://localhost:3001/uploads/avatars/demo-avatar-3.jpg',
    'Parent, volunteer, and local business owner.',
    TRUE, TRUE
  )
ON CONFLICT (email) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio;

-- =========================================================================
-- 2. DEMO COMMUNITIES with real logo + cover images
-- =========================================================================
INSERT INTO communities (id, name, slug, description, logo_url, cover_url, visibility, status, created_by)
VALUES
  (
    'c1000000-0000-4000-8000-000000000001',
    'Greenfield Residents Association',
    'greenfield-residents',
    'Official community for the Greenfield neighborhood. Stay updated on security, events, and local news.',
    'http://localhost:3001/uploads/communities/demo-logo-1.jpg',
    'http://localhost:3001/uploads/communities/demo-cover-1.jpg',
    'public', 'active',
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'Riverside Youth Club',
    'riverside-youth',
    'Sports, skills workshops, and social events for young people in the Riverside area.',
    'http://localhost:3001/uploads/communities/demo-logo-1.jpg',
    'http://localhost:3001/uploads/communities/demo-cover-2.jpg',
    'public', 'active',
    'a1000000-0000-4000-8000-000000000002'
  )
ON CONFLICT (slug) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  cover_url = EXCLUDED.cover_url,
  description = EXCLUDED.description;

-- Memberships
INSERT INTO community_memberships (community_id, user_id, role, status, joined_at)
VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'owner', 'active', NOW()),
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 'admin', 'active', NOW()),
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 'member', 'active', NOW()),
  ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 'owner', 'active', NOW()),
  ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'member', 'active', NOW()),
  ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 'member', 'active', NOW())
ON CONFLICT (community_id, user_id) DO NOTHING;

-- =========================================================================
-- 3. DEMO POSTS with real images
-- =========================================================================
INSERT INTO posts (id, author_id, community_id, title, body, post_type, is_official, is_pinned, image_url, status, published_at)
VALUES
  (
    'p1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Welcome to Greenfield Residents Association',
    'We are excited to launch our official community platform! Here you will find important announcements, event invitations, and ways to connect with neighbours.

Please update your profile and introduce yourself. Together we keep Greenfield safe and vibrant.',
    'announcement',
    TRUE,
    TRUE,
    'http://localhost:3001/uploads/posts/demo-post-1.jpg',
    'published',
    NOW() - INTERVAL '2 days'
  ),
  (
    'p1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000001',
    'Community Security Meeting – This Wednesday',
    'Join us this Wednesday at 19:00 for the monthly security briefing. We will discuss recent incidents, the new street lighting project, and how residents can support the neighbourhood watch.

Location: Community Hall, Greenfield Road
All residents welcome.',
    'urgent',
    TRUE,
    FALSE,
    'http://localhost:3001/uploads/posts/demo-post-2.jpg',
    'published',
    NOW() - INTERVAL '1 day'
  ),
  (
    'p1000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000003',
    'c1000000-0000-4000-8000-000000000001',
    NULL,
    'Just wanted to share these photos from last weekend''s street cleanup. Amazing turnout – thank you to everyone who came out with gloves and bags! The park looks so much better already.',
    'discussion',
    FALSE,
    FALSE,
    'http://localhost:3001/uploads/posts/demo-post-1.jpg',
    'published',
    NOW() - INTERVAL '8 hours'
  ),
  (
    'p1000000-0000-4000-8000-000000000004',
    'a1000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000002',
    'Youth Skills Workshop – Photography & Design',
    'This Saturday we are hosting a free creative skills session for ages 14–21. Bring your phone or camera – we will cover composition, basic editing, and how to tell stories with images.

Snacks provided. Limited to 25 places – RSVP on the event page!',
    'announcement',
    TRUE,
    TRUE,
    'http://localhost:3001/uploads/events/demo-event-1.jpg',
    'published',
    NOW() - INTERVAL '12 hours'
  ),
  (
    'p1000000-0000-4000-8000-000000000005',
    'a1000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000002',
    NULL,
    'Looking forward to the workshop this weekend! Anyone else bringing their younger siblings?',
    'discussion',
    FALSE,
    FALSE,
    NULL,
    'published',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  body = EXCLUDED.body,
  title = EXCLUDED.title,
  is_official = EXCLUDED.is_official,
  is_pinned = EXCLUDED.is_pinned;

-- =========================================================================
-- 4. DEMO EVENTS
-- =========================================================================
INSERT INTO events (id, community_id, created_by, title, description, event_type, location_type, location_name, address, start_at, end_at, capacity, status)
VALUES
  (
    'e1000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000002',
    'Monthly Security Meeting',
    'Review of recent incidents, street lighting update, and neighbourhood watch coordination.',
    'meeting',
    'physical',
    'Community Hall',
    '12 Greenfield Road',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
    80,
    'published'
  ),
  (
    'e1000000-0000-4000-8000-000000000002',
    'c1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000002',
    'Youth Skills Workshop – Photography',
    'Free creative session covering photo composition, mobile editing, and visual storytelling.',
    'training',
    'physical',
    'Riverside Community Centre',
    '45 River Road',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '3 hours',
    25,
    'published'
  ),
  (
    'e1000000-0000-4000-8000-000000000003',
    'c1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'Annual Community Braai',
    'Bring your own meat and a salad to share. Games for the kids, music, and great company!',
    'social',
    'physical',
    'Greenfield Park',
    'Main Gate, Greenfield Park',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '5 hours',
    150,
    'published'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_attendees (event_id, user_id, response, responded_at)
VALUES
  ('e1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'going', NOW()),
  ('e1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 'going', NOW()),
  ('e1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 'maybe', NOW()),
  ('e1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 'going', NOW()),
  ('e1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 'going', NOW())
ON CONFLICT (event_id, user_id) DO NOTHING;

SELECT 'Demo data with real images on posts and communities seeded!' AS result;

-- Set event images (run after 004_add_event_image_url.sql)
UPDATE events SET image_url = 'http://localhost:3001/uploads/events/demo-event-1.jpg'
WHERE id = 'e1000000-0000-4000-8000-000000000001';

UPDATE events SET image_url = 'http://localhost:3001/uploads/events/demo-event-2.jpg'
WHERE id = 'e1000000-0000-4000-8000-000000000002';

UPDATE events SET image_url = 'http://localhost:3001/uploads/events/demo-event-1.jpg'
WHERE id = 'e1000000-0000-4000-8000-000000000003';
