# Implement News Scoring Logic

This plan outlines the steps to integrate the scoring logic into the StorageNews backend. This will allow for prioritized news display (Top News) and better content filtering.

## Proposed Changes

### Database Migration

#### [MODIFY] [database.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/config/database.ts)
- Add `score` (DECIMAL) and `score_breakdown` (JSONB) columns to the `news` table in `initDatabase`.
- Run an `ALTER TABLE` query to add these columns to the existing table if they don't exist.

### Model and Type Updates

#### [NEW] [news.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/types/news.ts)
- Extract `NewsItem` and `ScoredNewsItem` interfaces into a dedicated types file to avoid circular dependencies between `models/News.ts` and `services/scoring.ts`.

#### [MODIFY] [News.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/models/News.ts)
- Update `saveNews` to calculate the score using `scoringService.calculateScore` before insertion.
- Update `getNews` to support an `orderBy` parameter (e.g., `score` or `published_at`).
- Add a new method `updateScores` to recalculate scores for existing news.

### Scoring Service Refinement

#### [MODIFY] [scoring.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/services/scoring.ts)
- Use the shared `NewsItem` interface.
- Ensure the scoring logic fully utilizes the weights defined in `rules.json`.

### Dashboard and Mobile API

#### [MODIFY] [news.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/routes/news.ts)
- Expose the `score` and `scoreBreakdown` in the API response.
- Default the "Hot" or "Recommend" view to sort by score.

## Verification Plan

### Automated Tests
- Script to fetch news and verify the `score` field is populated.
- Comparison of scores between relevant and generic news items.

### Manual Verification
- View the "Top News" in the dashboard or mobile app.
- Check database records using `psql` to confirm `score` and `score_breakdown` are correctly stored.
