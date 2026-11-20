import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { handleApiRequest } from './controllers/apiRouter';
import { aggregateMarketTrends } from './scheduled/marketAggregator';

// HTTPS API endpoint with Secret Manager bindings
export const api = onRequest(
  {
    cors: true,
    secrets: ['GEMINI_API_KEY', 'ADZUNA_APP_ID', 'ADZUNA_APP_KEY', 'YOUTUBE_API_KEY'],
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  (req, res) => {
    return handleApiRequest(req, res);
  }
);

// Scheduled market data aggregation (runs weekly on Sundays at midnight)
export const scheduledMarketRefresh = onSchedule(
  {
    schedule: '0 0 * * 0',
    timeZone: 'Asia/Kolkata',
    secrets: ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'],
  },
  async (event) => {
    await aggregateMarketTrends();
  }
);
