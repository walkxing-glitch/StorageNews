# Phase 2: Product Enhancements & UX

This phase focuses on making the StorageNews app feel more premium and data-driven by enhancing the mobile interface and improving the overall content discovery experience.

## Proposed Changes

### Mobile App (UX & Discovery)

#### [MODIFY] [index.tsx](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/mobile/app/(tabs)/index.tsx)
- **Top Filter Bar**: Add a horizontally scrollable list of Vendors (Dell, NetApp, Pure, etc.) and Categories (Product, Financial, etc.).
- **Score Visualization**: Add a small "Score" badge to news items. High-value items (>40) will get a "🔥 HOT" or distinct color highlight.
- **Web Experience**: Replace `Linking.openURL` with `expo-web-browser` for a more seamless in-app reading experience.

#### [MODIFY] [api.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/mobile/services/api.ts)
- Ensure `fetchNews` supports passing `vendor` and `category` as optional filters to the backend.

### Backend (API Refinement)

#### [MODIFY] [news.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/routes/news.ts)
- Ensure filtering by `vendor` and `category` is robust.
- Add an `orderBy` query parameter (defaulting to `score`).

## Verification Plan

### Manual Verification (Mobile)
- Swipe through the new Top Filter Bar and verify news list updates.
- Check that high-score news items have prominent visual indicators.
- Click a news item and verify it opens in an in-app browser overlay.
