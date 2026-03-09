# StorageNews Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 4: Daily news push to WeLink and WeChat (in progress)
- Full-text search functionality (planned)
- AI chat for news analysis (planned)

## [1.0.0] - 2026-02-06

### Added
- **Phase 1: News Scoring System**
  - Automated news aggregation from NewsAPI and RSS feeds
  - Intelligent scoring engine based on source, vendor, category, and keywords
  - PostgreSQL database with optimized indexes
  - RESTful API with filtering and sorting

- **Phase 2: UX Enhancements & AI Integration**
  - Dual-layer filter system (vendors and topics)
  - Score badges and hot news indicators (🔥 for score > 40)
  - In-app browser using expo-web-browser
  - AI-powered Chinese summaries for high-value news (DeepSeek API)
  - Mobile app with Expo Router

- **Phase 3: Visual Feed Transformation**
  - Featured card layout for high-scoring news (score > 50)
  - Compact thumbnail layout for regular news
  - Enhanced image extraction from RSS feeds
  - Gradient placeholders for missing images
  - Premium typography and spacing

- **Documentation**
  - Comprehensive README
  - System architecture documentation
  - Development guide with code standards
  - Deployment documentation
  - Product roadmap (Phase 4-9)

- **Development Tools**
  - ESLint configuration for TypeScript
  - Prettier for code formatting
  - GitHub Actions CI/CD pipeline
  - Docker Compose for local development

### Fixed
- Image URL not returned in API response
- RSS parser not extracting images from media tags
- Database conflict handling for image updates

### Changed
- Improved mobile UI with better visual hierarchy
- Optimized database queries with proper indexing
- Enhanced error handling in AI service

## [0.1.0] - 2026-02-05

### Added
- Initial project setup
- Basic news aggregation
- Simple mobile app prototype
