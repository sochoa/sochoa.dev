-- Create contact_submissions table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('received', 'read', 'replied'))
);

-- Create indexes for common queries
CREATE INDEX idx_contact_status ON contact_submissions(status) WHERE expires_at > NOW();
CREATE INDEX idx_contact_email ON contact_submissions(email) WHERE expires_at > NOW();
CREATE INDEX idx_contact_created_at ON contact_submissions(created_at DESC) WHERE expires_at > NOW();
CREATE INDEX idx_contact_expires_at ON contact_submissions(expires_at);
