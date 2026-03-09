import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDatabase } from './config/database.js';
import { startScheduler } from './jobs/scheduler.js';
import newsRoutes from './routes/news.js';
import pushRoutes from './routes/push.js';
import adminRoutes from './routes/admin.js';
import { calculateScore } from './services/scoring.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  const args = process.argv.slice(2);

  if (args.includes('--init-db')) {
    await initDatabase();
    console.log('Database initialized successfully');
    process.exit(0);
  }

  if (args.includes('--recalc-scores')) {
    await initDatabase();
    const { getNews, saveNews } = await import('./models/News.js');
    console.log('Recalculating all news scores and generating missing AI summaries...');
    const news = await getNews({ limit: 10000 });
    let updated = 0;
    for (const item of news) {
      // Logic inside saveNews already handles score calc and AI summary
      // We call saveNews again to trigger the update logic
      await saveNews(item);
      updated++;
      if (updated % 10 === 0) console.log(`Processed ${updated}/${news.length}...`);
    }
    console.log(`Finished processing ${updated} news items.`);
    process.exit(0);
  }

  try {
    // Initialize database
    await initDatabase();
    console.log('Database connected');

    // Start scheduler
    startScheduler();

    // Start server
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
