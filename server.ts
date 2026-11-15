import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  buildInsightsPrompt,
  extractGroundingSources,
  formatGeminiErrorMessage,
  getFallbackInsights,
  getTopicById,
  parseGroundedInsightsText,
} from './src/utils/marketInsights.ts';
import type { MarketInsightsResponse } from './src/utils/marketInsights.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INSIGHTS_CACHE_TTL_MS = 15 * 60 * 1000;
const insightsCache = new Map<string, { data: MarketInsightsResponse; expiresAt: number }>();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV !== 'development' && hasDist);

  app.use(express.json());

  // Health check endpoint for Cloud Run and monitoring
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: isProd ? 'production' : 'development',
    });
  });

  // Server-side Gemini AI Client (using environment secret GEMINI_API_KEY)
  const apiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize server-side GoogleGenAI client:', err);
    }
  }

  // AI Skill Matcher endpoint
  app.post('/api/ai/match', async (req, res) => {
    try {
      const { jobTitle, jobDescription, requiredSkills, candidates } = req.body;
      if (!aiClient) {
        return res.status(503).json({ error: 'Gemini API key is not configured on the server.', fallback: true });
      }

      const prompt = `You are the AI Skill Matcher for SkillShare, a hiring platform in Bangladesh.
Evaluate these candidate freelancers for the following job:
Job Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${(requiredSkills || []).join(', ')}

Candidates:
${JSON.stringify(
  (candidates || []).map((c: any) => ({
    id: c.uid,
    name: c.name,
    headline: c.headline,
    skills: c.skills,
    rating: c.rating,
    completedJobs: c.completedJobs,
    bio: (c.bio || '').slice(0, 200),
  })),
  null,
  2
)}

Select and rank the top 3 best matching candidates.
Return ONLY valid JSON array matching this schema:
[
  {
    "freelancerId": "string",
    "name": "string",
    "matchScore": number (50-99),
    "reasoning": "1-2 sentences explaining why they are ideal",
    "highlightedSkills": ["matching skill 1", "matching skill 2"]
  }
]`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '[]');
      return res.json({ matches: parsed });
    } catch (err: any) {
      console.error('Error in /api/ai/match:', err);
      return res.status(500).json({ error: err?.message || 'Failed to match freelancers.', fallback: true });
    }
  });

  // AI Proposal Writer endpoint
  app.post('/api/ai/proposal', async (req, res) => {
    try {
      const { jobTitle, jobDescription, requiredSkills, freelancerName, freelancerHeadline } = req.body;
      if (!aiClient) {
        return res.status(503).json({ error: 'Gemini API key is not configured on the server.', fallback: true });
      }

      const prompt = `You are an expert Bangladeshi freelancer drafting a professional proposal for a client on SkillShare BD.
Job Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${(requiredSkills || []).join(', ')}
My Name: ${freelancerName}
My Headline: ${freelancerHeadline}

Draft a persuasive, friendly, professional cover letter (2-3 paragraphs). Mention relevant experience, familiarity with local requirements (bKash/Nagad/Bangladesh market where relevant), and confidence in delivering on time.
Return ONLY valid JSON:
{
  "coverLetter": "string",
  "suggestedBid": 20000,
  "suggestedDays": 7
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/ai/proposal:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate proposal.', fallback: true });
    }
  });

  // Marketplace Insights endpoint powered by Google Search grounding
  app.post('/api/ai/market-insights', async (req, res) => {
    try {
      const topic = getTopicById(typeof req.body?.topicId === 'string' ? req.body.topicId : 'all');
      const forceRefresh = Boolean(req.body?.forceRefresh);

      if (!forceRefresh) {
        const cached = insightsCache.get(topic.id);
        if (cached && cached.expiresAt > Date.now()) {
          return res.json(cached.data);
        }
      }

      if (!aiClient) {
        return res.json({
          ...getFallbackInsights(topic.id),
          sources: [],
          searchQueries: [],
          generatedAt: new Date().toISOString(),
          isLiveGrounded: false,
          errorCode: 503,
          error: 'Live Google Search grounding is unconfigured in this environment. Showing curated 2026 market benchmarks.',
        } satisfies MarketInsightsResponse);
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: buildInsightsPrompt(topic.id),
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = response.text?.trim() || '';
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const { sources, searchQueries } = extractGroundingSources(groundingMetadata);
      const parsed = parseGroundedInsightsText(rawText, topic.id);

      const payload: MarketInsightsResponse = {
        ...parsed,
        sources,
        searchQueries,
        generatedAt: new Date().toISOString(),
        isLiveGrounded: true,
      };

      insightsCache.set(topic.id, {
        data: payload,
        expiresAt: Date.now() + INSIGHTS_CACHE_TTL_MS,
      });

      return res.json(payload);
    } catch (err: any) {
      const topic = getTopicById(typeof req.body?.topicId === 'string' ? req.body.topicId : 'all');
      const { message, status } = formatGeminiErrorMessage(err);
      console.warn(`Market insights live search fallback (${status}): ${message}`);
      return res.json({
        ...getFallbackInsights(topic.id),
        sources: [],
        searchQueries: [],
        generatedAt: new Date().toISOString(),
        isLiveGrounded: false,
        errorCode: status,
        error: message,
      } satisfies MarketInsightsResponse);
    }
  });

  if (isProd && hasDist) {
    // Serve production build files
    app.use(express.static(distPath));

    // Catch-all route to support client-side SPA routing
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // In dev mode without prebuilt dist, mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SkillShare server listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
