-- Initialize multiple databases for merged PostgreSQL container
-- This script runs when the PostgreSQL container starts for the first time

-- Create the Umami database
CREATE DATABASE umami_db;

-- Grant all privileges on both databases to the postgres user
GRANT ALL PRIVILEGES ON DATABASE umami_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE sbrubbles_forge_db TO postgres;
