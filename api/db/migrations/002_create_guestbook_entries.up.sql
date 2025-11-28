-- Create guestbook_entries table for storing user guestbook submissions
CREATE TABLE IF NOT EXISTS guestbook_entries (
    id UUID PRIMARY KEY,
    user_provider VARCHAR(50) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT valid_provider CHECK (user_provider IN ('google', 'linkedin'))
);

-- Create indexes for common queries
CREATE INDEX idx_guestbook_approved ON guestbook_entries(is_approved) WHERE deleted_at IS NULL;
CREATE INDEX idx_guestbook_created_at ON guestbook_entries(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_guestbook_user ON guestbook_entries(user_provider, user_id, created_at DESC) WHERE deleted_at IS NULL;
