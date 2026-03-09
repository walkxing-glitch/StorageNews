import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        summary TEXT,
        content TEXT,
        url VARCHAR(500),
        image_url VARCHAR(500),
        source_name VARCHAR(100),
        vendor VARCHAR(50),
        category VARCHAR(50),
        language VARCHAR(10) DEFAULT 'en',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hash VARCHAR(64) UNIQUE,
        score DECIMAL(10,2) DEFAULT 0,
        score_breakdown JSONB,
        summary_cn TEXT
      );

      -- Migration: add columns if they don't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='score') THEN
          ALTER TABLE news ADD COLUMN score DECIMAL(10,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='score_breakdown') THEN
          ALTER TABLE news ADD COLUMN score_breakdown JSONB;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='summary_cn') THEN
          ALTER TABLE news ADD COLUMN summary_cn TEXT;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        config JSONB,
        enabled BOOLEAN DEFAULT true,
        fetch_interval INTEGER DEFAULT 30,
        last_fetch_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        push_token VARCHAR(200) UNIQUE NOT NULL,
        platform VARCHAR(20),
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS push_logs (
        id SERIAL PRIMARY KEY,
        news_id INTEGER REFERENCES news(id),
        channel VARCHAR(20),
        status VARCHAR(20),
        pushed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_news_vendor ON news(vendor);
      CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
      CREATE INDEX IF NOT EXISTS idx_news_hash ON news(hash);
    `);
    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}
