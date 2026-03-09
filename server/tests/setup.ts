import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup test database or mock services if needed
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Cleanup after tests
  console.log('Cleaning up test environment...');
});

// Mock external APIs to avoid real network calls during tests
jest.mock('axios');
jest.mock('../src/services/ai.js', () => ({
  summarizeNews: jest.fn().mockResolvedValue('Mock AI summary for testing'),
}));

// Mock database connection for tests
jest.mock('../src/config/database.js', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    connect: jest.fn().mockResolvedValue({ release: jest.fn() }),
  },
}));
