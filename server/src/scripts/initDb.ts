import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 数据库初始化脚本
 */
async function initDb() {
    console.log('Initializing database...');

    try {
        const client = await pool.connect();
        // 创建新闻表
        await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT,
        content TEXT,
        url TEXT,
        image_url TEXT,
        source_name TEXT,
        vendor TEXT,
        category TEXT,
        language VARCHAR(10) DEFAULT 'en',
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        hash VARCHAR(64) UNIQUE NOT NULL
      )
    `);

        // 创建索引
        await client.query('CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_news_vendor ON news(vendor)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_news_hash ON news(hash)');

        console.log('Database initialized successfully.');
        client.release();
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initDb();
