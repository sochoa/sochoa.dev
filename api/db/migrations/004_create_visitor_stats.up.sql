-- Create visitor_stats table for storing aggregated visitor statistics
CREATE TABLE IF NOT EXISTS visitor_stats (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    page_path VARCHAR(1024) NOT NULL,
    country VARCHAR(2),
    referrer_domain VARCHAR(255),
    pageviews INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    latency_p50 FLOAT8,
    latency_p95 FLOAT8,
    latency_p99 FLOAT8,
    errors_4xx INTEGER NOT NULL DEFAULT 0,
    errors_5xx INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (date, page_path),
    CONSTRAINT non_negative_pageviews CHECK (pageviews >= 0),
    CONSTRAINT non_negative_visitors CHECK (unique_visitors >= 0),
    CONSTRAINT non_negative_errors_4xx CHECK (errors_4xx >= 0),
    CONSTRAINT non_negative_errors_5xx CHECK (errors_5xx >= 0)
);

-- Create indexes for common queries
CREATE INDEX idx_visitor_stats_date ON visitor_stats(date DESC);
CREATE INDEX idx_visitor_stats_page_path ON visitor_stats(page_path);
CREATE INDEX idx_visitor_stats_date_page ON visitor_stats(date DESC, page_path);
