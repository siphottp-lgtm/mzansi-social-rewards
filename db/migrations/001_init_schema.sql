-- Community Engagement Platform - PostgreSQL Schema
-- Migration 001: Core schema with soft deletes, UUID primary keys, proper indexes & constraints
-- Compatible with PostgreSQL 14+

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. USERS
-- =========================================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(30) UNIQUE,
    password_hash   VARCHAR(255),                    -- null if social-only
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    display_name    VARCHAR(150),
    bio             TEXT,
    avatar_url      TEXT,
    location        VARCHAR(255),
    timezone        VARCHAR(50) DEFAULT 'UTC',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP WITH TIME ZONE          -- soft delete
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- =========================================================================
-- 2. COMMUNITIES
-- =========================================================================
CREATE TABLE communities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    logo_url        TEXT,
    cover_url       TEXT,
    rules           TEXT,
    visibility      VARCHAR(30) NOT NULL DEFAULT 'private'
                        CHECK (visibility IN ('public', 'private', 'invite_only')),
    status          VARCHAR(30) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'archived', 'suspended')),
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_communities_slug ON communities(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_communities_status ON communities(status) WHERE deleted_at IS NULL;

-- =========================================================================
-- 3. COMMUNITY MEMBERSHIPS
-- =========================================================================
CREATE TABLE community_memberships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(30) NOT NULL DEFAULT 'member'
                        CHECK (role IN ('member', 'moderator', 'admin', 'owner')),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'active', 'rejected', 'removed')),
    joined_at       TIMESTAMP WITH TIME ZONE,
    approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_community_user UNIQUE (community_id, user_id)
);

CREATE INDEX idx_memberships_community ON community_memberships(community_id);
CREATE INDEX idx_memberships_user ON community_memberships(user_id);
CREATE INDEX idx_memberships_status ON community_memberships(status);

-- =========================================================================
-- 4. GROUPS (committees / sub-groups inside a community)
-- =========================================================================
CREATE TABLE groups (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    visibility      VARCHAR(30) NOT NULL DEFAULT 'members_only'
                        CHECK (visibility IN ('public', 'private', 'members_only')),
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_groups_community ON groups(community_id) WHERE deleted_at IS NULL;

CREATE TABLE group_memberships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(30) NOT NULL DEFAULT 'member'
                        CHECK (role IN ('member', 'moderator', 'admin')),
    status          VARCHAR(30) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'pending', 'removed')),
    joined_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_group_user UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);

-- =========================================================================
-- 5. ATTACHMENTS (shared media / files)
-- =========================================================================
CREATE TABLE attachments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_type       VARCHAR(100),
    mime_type       VARCHAR(100),
    file_size       BIGINT,
    storage_url     TEXT NOT NULL,
    thumbnail_url   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 6. POSTS
-- =========================================================================
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    group_id        UUID REFERENCES groups(id) ON DELETE SET NULL,
    title           VARCHAR(500),
    body            TEXT NOT NULL,
    post_type       VARCHAR(30) NOT NULL DEFAULT 'discussion'
                        CHECK (post_type IN ('discussion', 'announcement', 'urgent', 'notice')),
    visibility      VARCHAR(30) NOT NULL DEFAULT 'community'
                        CHECK (visibility IN ('community', 'group', 'public')),
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    is_official     BOOLEAN NOT NULL DEFAULT FALSE,   -- only admins/mods can set
    status          VARCHAR(30) NOT NULL DEFAULT 'published'
                        CHECK (status IN ('published', 'draft', 'archived', 'deleted')),
    published_at    TIMESTAMP WITH TIME ZONE,
    expires_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_posts_community ON posts(community_id, published_at DESC) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_official ON posts(community_id, is_official) WHERE is_official = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_posts_pinned ON posts(community_id, is_pinned) WHERE is_pinned = TRUE AND deleted_at IS NULL;

-- Post ↔ Attachment (many-to-many)
CREATE TABLE post_attachments (
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    attachment_id   UUID NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (post_id, attachment_id)
);

-- =========================================================================
-- 7. COMMENTS
-- =========================================================================
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,  -- for threaded replies
    body            TEXT NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'published'
                        CHECK (status IN ('published', 'hidden', 'deleted')),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_comments_post ON comments(post_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_author ON comments(author_id);

-- =========================================================================
-- 8. REACTIONS
-- =========================================================================
CREATE TABLE reactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type     VARCHAR(30) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id       UUID NOT NULL,
    reaction_type   VARCHAR(30) NOT NULL DEFAULT 'like'
                        CHECK (reaction_type IN ('like', 'love', 'helpful', 'celebrate', 'sad', 'angry')),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_target_reaction UNIQUE (user_id, target_type, target_id, reaction_type)
);

CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);

-- =========================================================================
-- 9. EVENTS
-- =========================================================================
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    group_id        UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    event_type      VARCHAR(30) NOT NULL DEFAULT 'meeting'
                        CHECK (event_type IN ('meeting', 'social', 'training', 'other')),
    location_type   VARCHAR(30) NOT NULL DEFAULT 'physical'
                        CHECK (location_type IN ('physical', 'online', 'hybrid')),
    location_name   VARCHAR(255),
    address         TEXT,
    online_url      TEXT,
    start_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity        INTEGER,
    status          VARCHAR(30) NOT NULL DEFAULT 'published'
                        CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_events_community ON events(community_id, start_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_start ON events(start_at) WHERE status = 'published' AND deleted_at IS NULL;

CREATE TABLE event_attendees (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response        VARCHAR(30) NOT NULL DEFAULT 'going'
                        CHECK (response IN ('going', 'maybe', 'not_going')),
    checked_in_at   TIMESTAMP WITH TIME ZONE,
    responded_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);

-- =========================================================================
-- 10. POLLS
-- =========================================================================
CREATE TABLE polls (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id            UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    created_by              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question                TEXT NOT NULL,
    allows_multiple_answers BOOLEAN NOT NULL DEFAULT FALSE,
    anonymous_voting        BOOLEAN NOT NULL DEFAULT FALSE,
    starts_at               TIMESTAMP WITH TIME ZONE,
    ends_at                 TIMESTAMP WITH TIME ZONE,
    status                  VARCHAR(30) NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'active', 'closed')),
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE poll_options (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id         UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text     VARCHAR(500) NOT NULL,
    display_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE poll_votes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id         UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    poll_option_id  UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_poll_user_option UNIQUE (poll_id, user_id, poll_option_id)
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);

-- =========================================================================
-- 11. NOTIFICATIONS
-- =========================================================================
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type   VARCHAR(50) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    entity_type         VARCHAR(50),
    entity_id           UUID,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

CREATE TABLE user_notification_preferences (
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type   VARCHAR(50) NOT NULL,
    in_app_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, notification_type)
);

-- =========================================================================
-- 12. DOCUMENTS
-- =========================================================================
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(50),
    attachment_id   UUID REFERENCES attachments(id) ON DELETE SET NULL,
    visibility      VARCHAR(30) NOT NULL DEFAULT 'members'
                        CHECK (visibility IN ('members', 'admins', 'public')),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_documents_community ON documents(community_id) WHERE deleted_at IS NULL;

-- =========================================================================
-- 13. MODERATION
-- =========================================================================
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type    VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'comment', 'user', 'message')),
    content_id      UUID NOT NULL,
    reason          VARCHAR(100) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status);

CREATE TABLE moderation_actions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type    VARCHAR(50) NOT NULL,
    content_id      UUID NOT NULL,
    action          VARCHAR(30) NOT NULL
                        CHECK (action IN ('hide', 'delete', 'restore', 'warn', 'suspend')),
    reason          TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 14. AUDIT LOGS
-- =========================================================================
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    community_id    UUID REFERENCES communities(id) ON DELETE CASCADE,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_community ON audit_logs(community_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);

-- =========================================================================
-- HELPER: updated_at trigger function
-- =========================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that have updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_memberships_updated_at BEFORE UPDATE ON community_memberships FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- OPTIONAL: Seed a platform admin (change password after first login)
-- =========================================================================
-- INSERT INTO users (email, password_hash, first_name, last_name, display_name, is_verified)
-- VALUES ('admin@example.com', crypt('ChangeMe123!', gen_salt('bf')), 'Platform', 'Admin', 'Platform Admin', TRUE);
