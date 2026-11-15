import { Profile } from '../types';
import {
  getFallbackInsights,
  MarketInsightsResponse,
} from '../utils/marketInsights';

export interface AIMatchResult {
  freelancerId: string;
  name: string;
  matchScore: number;
  reasoning: string;
  highlightedSkills: string[];
}

/**
 * AI Skill Matcher: calls the server-side Gemini endpoint and falls back to
 * deterministic local skill matching when the API is unavailable.
 */
export async function matchFreelancersWithAI(
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[],
  candidates: Profile[]
): Promise<AIMatchResult[]> {
  try {
    const res = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, jobDescription, requiredSkills, candidates }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        return data.matches;
      }
    }
  } catch {
    // Fallback to deterministic local matching below
  }

  const scored = candidates.map((c) => {
    let matches = 0;
    const lowerSkills = c.skills.map((s) => s.toLowerCase());
    const matchedList: string[] = [];

    requiredSkills.forEach((req) => {
      const r = req.toLowerCase();
      if (lowerSkills.some((s) => s.includes(r) || r.includes(s))) {
        matches++;
        matchedList.push(req);
      }
    });

    const skillScore = requiredSkills.length > 0 ? (matches / requiredSkills.length) * 60 : 30;
    const ratingScore = (c.rating / 5) * 30;
    const jobsScore = Math.min(10, c.completedJobs * 0.2);
    const totalScore = Math.round(skillScore + ratingScore + jobsScore);

    return {
      freelancerId: c.uid,
      name: c.name,
      matchScore: Math.min(99, Math.max(65, totalScore)),
      reasoning: `${c.name} has a strong ${c.rating}★ rating with ${c.completedJobs} completed jobs and proven expertise in ${c.skills.slice(0, 3).join(', ')}.`,
      highlightedSkills: matchedList.length > 0 ? matchedList : c.skills.slice(0, 3),
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 3);
}

/**
 * AI Proposal Writer: calls the server-side Gemini endpoint and falls back to
 * a tailored local proposal template when the API is unavailable.
 */
export async function generateAIProposal(
  jobTitle: string,
  jobDescription: string,
  freelancer: Profile,
  bidAmount: number,
  deliveryDays: number
): Promise<string> {
  try {
    const res = await fetch('/api/ai/proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobTitle,
        jobDescription,
        requiredSkills: freelancer.skills,
        freelancerName: freelancer.name,
        freelancerHeadline: freelancer.headline,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.coverLetter) {
        return data.coverLetter;
      }
    }
  } catch {
    // Fallback to template below
  }

  return `Hello! I reviewed your project for "${jobTitle}" and would love to help you bring this to life.

With proven experience in ${freelancer.skills.slice(0, 4).join(', ')} and a track record of ${freelancer.completedJobs}+ completed projects (${freelancer.rating}★ rating), I specialize in delivering high-quality, clean, and reliable work tailored to your goals.

For this project, I can deliver the complete deliverables within ${deliveryDays} days for ৳${bidAmount.toLocaleString('en-IN')}, including milestone updates and escrow-protected revisions to ensure your complete satisfaction.

I am available right now to discuss the details and get started immediately. Looking forward to collaborating!

Best regards,
${freelancer.name}`;
}

/**
 * Marketplace Insights: fetches Google Search grounded industry trends from the server.
 * Propagates server errors clearly so the UI can surface retry controls alongside
 * an optional local benchmark fallback.
 */
export async function fetchMarketInsights(
  topicId: string,
  forceRefresh = false
): Promise<MarketInsightsResponse> {
  const res = await fetch('/api/ai/market-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId, forceRefresh }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage =
      typeof data?.error === 'string' && data.error.trim().length > 0
        ? data.error
        : `Request failed with status ${res.status}`;
    const err = new Error(errorMessage) as Error & {
      fallbackData?: MarketInsightsResponse;
    };
    err.fallbackData = {
      ...getFallbackInsights(topicId),
      sources: [],
      searchQueries: [],
      generatedAt: new Date().toISOString(),
      isLiveGrounded: false,
      error: errorMessage,
    };
    throw err;
  }

  return data as MarketInsightsResponse;
}
