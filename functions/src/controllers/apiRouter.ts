import cors from 'cors';
import { analyzeResumeWithGemini, analyzeJobDescriptionWithGemini, chatWithLensBotGemini } from '../services/geminiService';
import { fetchAdzunaJobs } from '../services/adzunaService';
import { searchYouTubeTutorials } from '../services/youtubeService';

const corsHandler = cors({ origin: true });

export function handleApiRequest(req: any, res: any) {
  return corsHandler(req, res, async () => {
    const path = req.path || req.url;
    const method = req.method;

    try {
      // 1. Health check & provider status
      if (path === '/api/health' || path === '/health') {
        const geminiStatus = process.env.GEMINI_API_KEY ? 'configured' : 'unconfigured';
        const adzunaStatus = process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY ? 'configured' : 'unconfigured';
        const youtubeStatus = process.env.YOUTUBE_API_KEY ? 'configured' : 'unconfigured';

        return res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          providers: {
            gemini: { status: geminiStatus },
            adzuna: { status: adzunaStatus },
            youtube: { status: youtubeStatus },
          },
        });
      }

      // 2. Resume analysis with Gemini
      if (path === '/api/resume/analyze' && method === 'POST') {
        const { text, targetRole } = req.body || {};
        if (!text || !targetRole) {
          return res.status(400).json({ error: 'Missing required fields: text, targetRole' });
        }
        const result = await analyzeResumeWithGemini(text, targetRole);
        return res.status(200).json(result);
      }

      // 3. Job Description vs Resume analysis
      if (path === '/api/jobs/analyze' && method === 'POST') {
        const { resumeText, jobDescription } = req.body || {};
        if (!resumeText || !jobDescription) {
          return res.status(400).json({ error: 'Missing required fields: resumeText, jobDescription' });
        }
        const result = await analyzeJobDescriptionWithGemini(resumeText, jobDescription);
        return res.status(200).json(result);
      }

      // 4. Job Search via Adzuna
      if (path === '/api/jobs/search' && method === 'GET') {
        const { role, location, keywords, page } = req.query || {};
        const result = await fetchAdzunaJobs({
          role: role as string,
          location: location as string,
          keywords: keywords as string,
          page: page ? parseInt(page as string, 10) : 1,
        });
        return res.status(200).json(result);
      }

      // 5. YouTube Educational Resource discovery
      if (path === '/api/resources/discover' && method === 'GET') {
        const { query: searchQuery } = req.query || {};
        const result = await searchYouTubeTutorials((searchQuery as string) || 'Full Stack Web Development');
        return res.status(200).json(result);
      }

      // 6. LensBot AI Mentorship Chat
      if (path === '/api/lensbot/chat' && method === 'POST') {
        const { prompt, context } = req.body || {};
        if (!prompt) {
          return res.status(400).json({ error: 'Missing required field: prompt' });
        }
        const result = await chatWithLensBotGemini(prompt, context);
        return res.status(200).json(result);
      }

      return res.status(404).json({ error: 'Endpoint not found', path });
    } catch (error: any) {
      console.error('API Error at', path, ':', error);
      return res.status(500).json({
        error: error?.message || 'Internal server error',
      });
    }
  });
}
