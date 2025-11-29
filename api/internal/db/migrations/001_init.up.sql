-- Initialize schema for sochoa.dev API
-- Compatible with both PostgreSQL and SQLite

-- Posts table
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    body TEXT NOT NULL,
    tags TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Guestbook entries table
CREATE TABLE guestbook_entries (
    id TEXT PRIMARY KEY,
    user_provider VARCHAR(50) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    approved BOOLEAN DEFAULT 0,
    deleted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guestbook_created_at ON guestbook_entries(created_at DESC);
CREATE INDEX idx_guestbook_approved ON guestbook_entries(approved);
CREATE INDEX idx_guestbook_deleted_at ON guestbook_entries(deleted_at);

-- Contact submissions table
CREATE TABLE contact_submissions (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_expires_at ON contact_submissions(expires_at);
CREATE INDEX idx_contact_created_at ON contact_submissions(created_at DESC);

-- Visitor stats table
CREATE TABLE visitor_stats (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    page_path VARCHAR(1024) NOT NULL,
    country VARCHAR(2),
    referrer_domain VARCHAR(255),
    pageviews INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    latency_p50 REAL,
    latency_p95 REAL,
    latency_p99 REAL,
    errors_4xx INTEGER NOT NULL DEFAULT 0,
    errors_5xx INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, page_path)
);

CREATE INDEX idx_stats_date ON visitor_stats(date DESC);
CREATE INDEX idx_stats_page_path ON visitor_stats(page_path);
CREATE INDEX idx_stats_country ON visitor_stats(country);
CREATE INDEX idx_stats_created_at ON visitor_stats(created_at DESC);
