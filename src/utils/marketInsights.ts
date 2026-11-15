export interface GroundingSource {
  title: string;
  uri: string;
  domain: string;
}

export interface MarketTrendItem {
  skill: string;
  category: string;
  demandLevel: 'Surging' | 'High Demand' | 'Steady Growth';
  growthSignal: string;
  hourlyRateRange: string;
  summary: string;
  searchKeyword: string;
}

export interface MarketInsightsResponse {
  topic: string;
  headline: string;
  executiveSummary: string;
  trends: MarketTrendItem[];
  sources: GroundingSource[];
  searchQueries: string[];
  generatedAt: string;
  isLiveGrounded: boolean;
  error?: string;
  errorCode?: number;
}

export function formatGeminiErrorMessage(err: unknown): { message: string; status: number } {
  const rawMessage =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : '';

  let parsedCode: number | undefined;
  let parsedStatus = '';
  let parsedInnerMsg = rawMessage;

  const firstBrace = rawMessage.indexOf('{');
  const lastBrace = rawMessage.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const obj = JSON.parse(rawMessage.slice(firstBrace, lastBrace + 1)) as {
        error?: { code?: number; message?: string; status?: string };
        code?: number;
        message?: string;
        status?: string;
      };
      const target = obj.error || obj;
      if (typeof target.code === 'number') parsedCode = target.code;
      if (typeof target.status === 'string') parsedStatus = target.status;
      if (typeof target.message === 'string') parsedInnerMsg = target.message;
    } catch {
      // keep rawMessage
    }
  }

  const lower = `${parsedStatus} ${parsedInnerMsg}`.toLowerCase();
  if (parsedCode === 429 || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      message: 'Live Google Search quota reached. Showing curated 2026 market benchmarks.',
    };
  }
  if (
    parsedCode === 401 ||
    parsedCode === 403 ||
    lower.includes('permission_denied') ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key')
  ) {
    return {
      status: parsedCode || 403,
      message: 'Live Google Search is unavailable for the current API key. Showing curated 2026 market benchmarks.',
    };
  }

  const concise = parsedInnerMsg.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  return {
    status: parsedCode || 500,
    message: concise.length > 0 ? concise.slice(0, 140) : 'Live search is temporarily unavailable. Showing curated 2026 benchmarks.',
  };
}

export const INSIGHT_TOPICS = [
  { id: 'all', label: 'All Top Skills', query: 'top in-demand freelance skills globally and remote hiring trends' },
  { id: 'web-ai', label: 'Web & AI Engineering', query: 'React Next.js TypeScript full-stack AI integration freelance market trends' },
  { id: 'design', label: 'UI/UX & Design', query: 'UI UX Figma product design system freelance hiring trends' },
  { id: 'video', label: 'Video & Motion', query: 'short-form video editing YouTube motion graphics freelance demand trends' },
  { id: 'marketing', label: 'Marketing & SEO', query: 'digital marketing technical SEO performance ads freelance trends' },
  { id: 'data', label: 'Data & Automation', query: 'workflow automation Python data analytics scraping freelance hiring trends' },
] as const;

export type InsightTopicId = (typeof INSIGHT_TOPICS)[number]['id'];

export function getTopicById(topicId?: string) {
  return INSIGHT_TOPICS.find((t) => t.id === topicId || t.label === topicId) ?? INSIGHT_TOPICS[0];
}

export function buildInsightsPrompt(topicId: string, referenceDate = new Date()): string {
  const topic = getTopicById(topicId);
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });

  return `Use Google Search to research the latest ${month} ${year} industry trends, client hiring demand, and global/South Asia remote freelance benchmarks for: "${topic.label}" (${topic.query}).

Provide a concise, factual market briefing for freelancers and hiring managers on SkillShare (a hiring platform in Bangladesh where prices are often displayed in BDT ৳ alongside international remote equivalents).

Format your response using a single JSON code block inside \`\`\`json ... \`\`\` with this exact structure (do not invent URLs; Google Search grounding metadata handles source URLs):
{
  "headline": "Short crisp headline summarizing the current ${month} ${year} shift (max 10 words)",
  "executiveSummary": "2-sentence factual overview grounded in recent market reports and hiring demand.",
  "trends": [
    {
      "skill": "Specific skill name (e.g. Next.js & AI Agents)",
      "category": "Web Development | Graphic Design | Video Editing | Digital Marketing | Data Entry",
      "demandLevel": "Surging",
      "growthSignal": "Quantified growth or hiring signal (e.g. +38% YoY job demand)",
      "hourlyRateRange": "Estimated BDT rate range (e.g. ৳1,500–৳3,500/hr)",
      "summary": "1 concise sentence explaining what clients are actively hiring for right now.",
      "searchKeyword": "Short keyword for filtering talent (e.g. React)"
    }
  ]
}

Include exactly 4 distinct, high-signal trend objects in "trends". Keep every field concrete, current for ${year}, and free of hype.`;
}

interface RawGroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

interface RawGroundingMetadata {
  groundingChunks?: RawGroundingChunk[];
  webSearchQueries?: string[];
}

export function extractDomainFromUrl(uri: string): string {
  try {
    const parsed = new URL(uri);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

export function extractGroundingSources(groundingMetadata: unknown): {
  sources: GroundingSource[];
  searchQueries: string[];
} {
  if (!groundingMetadata || typeof groundingMetadata !== 'object') {
    return { sources: [], searchQueries: [] };
  }

  const meta = groundingMetadata as RawGroundingMetadata;
  const seenUris = new Set<string>();
  const sources: GroundingSource[] = [];

  if (Array.isArray(meta.groundingChunks)) {
    for (const chunk of meta.groundingChunks) {
      const uri = chunk?.web?.uri?.trim();
      if (!uri || (!uri.startsWith('http://') && !uri.startsWith('https://'))) {
        continue;
      }
      if (seenUris.has(uri)) {
        continue;
      }
      seenUris.add(uri);
      const domain = extractDomainFromUrl(uri);
      const rawTitle = chunk?.web?.title?.trim();
      sources.push({
        title: rawTitle && rawTitle.length > 0 ? rawTitle : domain,
        uri,
        domain,
      });
    }
  }

  const searchQueries = Array.isArray(meta.webSearchQueries)
    ? meta.webSearchQueries.filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    : [];

  return { sources, searchQueries };
}

function normalizeDemandLevel(value: unknown): MarketTrendItem['demandLevel'] {
  const s = String(value || '').toLowerCase();
  if (s.includes('surg') || s.includes('rapid') || s.includes('explod')) return 'Surging';
  if (s.includes('high') || s.includes('strong')) return 'High Demand';
  return 'Steady Growth';
}

export function parseGroundedInsightsText(
  rawText: string,
  topicId: string
): Omit<MarketInsightsResponse, 'sources' | 'searchQueries' | 'generatedAt' | 'isLiveGrounded'> {
  const topic = getTopicById(topicId);
  const cleaned = (rawText || '').trim();

  // Try extracting fenced JSON block first, then raw JSON object
  const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonCandidate = fencedMatch ? fencedMatch[1].trim() : cleaned;

  const firstBrace = jsonCandidate.indexOf('{');
  const lastBrace = jsonCandidate.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = jsonCandidate.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(slice) as {
        headline?: string;
        executiveSummary?: string;
        trends?: Array<Partial<MarketTrendItem>>;
      };

      const validTrends: MarketTrendItem[] = Array.isArray(parsed.trends)
        ? parsed.trends
            .filter((item) => item && typeof item.skill === 'string' && item.skill.trim().length > 0)
            .slice(0, 4)
            .map((item) => ({
              skill: item.skill!.trim(),
              category: (item.category || topic.label).trim(),
              demandLevel: normalizeDemandLevel(item.demandLevel),
              growthSignal: (item.growthSignal || 'Strong Hiring Volume').trim(),
              hourlyRateRange: (item.hourlyRateRange || '৳1,200–৳2,800/hr').trim(),
              summary: (item.summary || 'Sustained demand across remote and local client projects.').trim(),
              searchKeyword: (item.searchKeyword || item.skill!.split(/[&,/\s]+/)[0] || '').trim(),
            }))
        : [];

      if (validTrends.length > 0) {
        return {
          topic: topic.label,
          headline: (parsed.headline || `${topic.label} Hiring Trends`).trim(),
          executiveSummary: (
            parsed.executiveSummary ||
            'Latest market signals compiled from live web research on freelance skill demand and project budgets.'
          ).trim(),
          trends: validTrends,
        };
      }
    } catch {
      // Fall through to prose / markdown line parsing
    }
  }

  // Fallback: extract prose summary and bullet points if model returned plain Markdown
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bulletLines = lines.filter((l) => /^([-*•]|\d+\.)\s+/.test(l));
  const summaryLines = lines.filter((l) => !/^([-*•]|\d+\.|#)/.test(l) && !l.startsWith('```'));

  const parsedBullets: MarketTrendItem[] = bulletLines.slice(0, 4).map((line) => {
    const body = line.replace(/^([-*•]|\d+\.)\s+/, '').replace(/\*\*/g, '');
    const parts = body.split(/[:–—-]/);
    const skill = (parts[0] || topic.label).trim().slice(0, 48);
    const summary = (parts.slice(1).join(' - ') || body).trim();
    return {
      skill,
      category: topic.label,
      demandLevel: 'High Demand',
      growthSignal: 'Active Client Demand',
      hourlyRateRange: '৳1,200–৳3,000/hr',
      summary,
      searchKeyword: skill.split(/\s+/)[0] || '',
    };
  });

  if (parsedBullets.length > 0) {
    return {
      topic: topic.label,
      headline: `${topic.label} Industry Trends`,
      executiveSummary:
        summaryLines.slice(0, 2).join(' ') ||
        'Live market analysis summarizing current freelance hiring priorities and rate expectations.',
      trends: parsedBullets,
    };
  }

  return getFallbackInsights(topicId);
}

export function getFallbackInsights(
  topicId: string
): Omit<MarketInsightsResponse, 'sources' | 'searchQueries' | 'generatedAt' | 'isLiveGrounded'> {
  const topic = getTopicById(topicId);

  const presets: Record<InsightTopicId, Omit<MarketInsightsResponse, 'sources' | 'searchQueries' | 'generatedAt' | 'isLiveGrounded'>> = {
    all: {
      topic: topic.label,
      headline: 'AI-Assisted Delivery & Full-Stack Execution Lead Demand',
      executiveSummary:
        'Businesses in 2026 prioritize specialists who pair core engineering, design, or production craft with practical AI automation to shorten turnaround times.',
      trends: [
        {
          skill: 'Full-Stack React & Next.js',
          category: 'Web Development',
          demandLevel: 'Surging',
          growthSignal: '+34% YoY Project Postings',
          hourlyRateRange: '৳1,400–৳3,200/hr',
          summary: 'SMEs and startups seek fast SaaS MVPs, e-commerce checkouts, and API integrations.',
          searchKeyword: 'React',
        },
        {
          skill: 'Product UI/UX & Design Systems',
          category: 'Graphic Design',
          demandLevel: 'High Demand',
          growthSignal: 'High Conversion Focus',
          hourlyRateRange: '৳1,100–৳2,600/hr',
          summary: 'Teams hire Figma specialists to modernize web dashboards and mobile onboarding flows.',
          searchKeyword: 'Figma',
        },
        {
          skill: 'Short-Form Video & Motion Reels',
          category: 'Video Editing',
          demandLevel: 'Surging',
          growthSignal: '+41% Brand Content Spend',
          hourlyRateRange: '৳900–৳2,200/hr',
          summary: 'Retention-focused Reels, YouTube Shorts, and product explainers drive recurring retainers.',
          searchKeyword: 'Video Editing',
        },
        {
          skill: 'Technical SEO & Performance Ads',
          category: 'Digital Marketing',
          demandLevel: 'Steady Growth',
          growthSignal: 'ROI-Tracked Retainers',
          hourlyRateRange: '৳1,000–৳2,400/hr',
          summary: 'Local and export brands invest in bilingual SEO and measurable Meta/Google ad funnels.',
          searchKeyword: 'SEO',
        },
      ],
    },
    'web-ai': {
      topic: topic.label,
      headline: 'TypeScript Stacks & Applied AI APIs Dominate Engineering',
      executiveSummary:
        'Clients favor full-stack engineers capable of shipping secure API backends, payment integrations, and grounded AI workflows in single engagements.',
      trends: [
        {
          skill: 'Next.js & TypeScript Apps',
          category: 'Web Development',
          demandLevel: 'Surging',
          growthSignal: '+36% Startup Demand',
          hourlyRateRange: '৳1,500–৳3,500/hr',
          summary: 'Production web apps with server-side rendering and responsive mobile UX.',
          searchKeyword: 'TypeScript',
        },
        {
          skill: 'Applied AI & LLM Integrations',
          category: 'Web Development',
          demandLevel: 'Surging',
          growthSignal: '+52% Custom Workflow Briefs',
          hourlyRateRange: '৳1,800–৳4,000/hr',
          summary: 'Document search, support triage, and structured extraction wired into business portals.',
          searchKeyword: 'Python',
        },
        {
          skill: 'Flutter Cross-Platform Apps',
          category: 'Web Development',
          demandLevel: 'High Demand',
          growthSignal: 'Dual iOS + Android Delivery',
          hourlyRateRange: '৳1,400–৳3,000/hr',
          summary: 'Retail and fintech businesses commission unified mobile apps with local wallet hooks.',
          searchKeyword: 'Flutter',
        },
        {
          skill: 'Node.js & Cloud Deployment',
          category: 'Web Development',
          demandLevel: 'Steady Growth',
          growthSignal: 'API & Database Modernization',
          hourlyRateRange: '৳1,300–৳2,900/hr',
          summary: 'REST/GraphQL microservices, database migrations, and automated deployment pipelines.',
          searchKeyword: 'Node.js',
        },
      ],
    },
    design: {
      topic: topic.label,
      headline: 'Component Libraries & Accessible Interfaces Set the Standard',
      executiveSummary:
        'Product teams look beyond static mockups toward interactive Figma prototypes, reusable design tokens, and developer-ready handoffs.',
      trends: [
        {
          skill: 'Figma Design Systems',
          category: 'Graphic Design',
          demandLevel: 'Surging',
          growthSignal: '+29% SaaS Redesigns',
          hourlyRateRange: '৳1,200–৳2,800/hr',
          summary: 'Scalable variable tokens, dark/light modes, and multi-screen component specs.',
          searchKeyword: 'Figma',
        },
        {
          skill: 'E-Commerce Conversion UX',
          category: 'Graphic Design',
          demandLevel: 'High Demand',
          growthSignal: 'Checkout Optimization',
          hourlyRateRange: '৳1,000–৳2,300/hr',
          summary: 'Mobile-first storefronts engineered to reduce cart abandonment and clarify pricing.',
          searchKeyword: 'UI/UX',
        },
        {
          skill: 'Brand Identity & Packaging',
          category: 'Graphic Design',
          demandLevel: 'Steady Growth',
          growthSignal: 'D2C Launch Demand',
          hourlyRateRange: '৳900–৳2,200/hr',
          summary: 'Cohesive logos, social kits, and print packaging for emerging consumer brands.',
          searchKeyword: 'Branding',
        },
        {
          skill: 'Interactive Prototyping',
          category: 'Graphic Design',
          demandLevel: 'High Demand',
          growthSignal: 'Faster Stakeholder Sign-Off',
          hourlyRateRange: '৳1,200–৳2,600/hr',
          summary: 'Clickable user flows validated before engineering sprints begin.',
          searchKeyword: 'UI Design',
        },
      ],
    },
    video: {
      topic: topic.label,
      headline: 'Retention Editing & Motion Graphics Lead Content Budgets',
      executiveSummary:
        'Creators, SaaS founders, and retail brands prioritize tight pacing, clean captions, and product UI motion reels over raw long-form cuts.',
      trends: [
        {
          skill: 'Short-Form Retention Editing',
          category: 'Video Editing',
          demandLevel: 'Surging',
          growthSignal: '+44% Monthly Retainers',
          hourlyRateRange: '৳900–৳2,100/hr',
          summary: 'High-pacing Reels, TikToks, and YouTube Shorts with custom sound design.',
          searchKeyword: 'Video Editing',
        },
        {
          skill: 'SaaS Product Explainers',
          category: 'Video Editing',
          demandLevel: 'High Demand',
          growthSignal: 'B2B Launch Kits',
          hourlyRateRange: '৳1,300–৳2,900/hr',
          summary: 'Screen-captured UI animations and After Effects motion callouts for landing pages.',
          searchKeyword: 'Motion Graphics',
        },
        {
          skill: 'YouTube Documentary Cuts',
          category: 'Video Editing',
          demandLevel: 'High Demand',
          growthSignal: 'Long-Form Channel Growth',
          hourlyRateRange: '৳1,000–৳2,400/hr',
          summary: 'Narrative pacing, B-roll sourcing, and color grading for educational channels.',
          searchKeyword: 'Premiere Pro',
        },
        {
          skill: 'Social Ad Creative Variants',
          category: 'Video Editing',
          demandLevel: 'Steady Growth',
          growthSignal: 'Multi-Hook A/B Testing',
          hourlyRateRange: '৳850–৳1,900/hr',
          summary: 'Multiple 3-second opening hooks produced efficiently for paid campaign testing.',
          searchKeyword: 'After Effects',
        },
      ],
    },
    marketing: {
      topic: topic.label,
      headline: 'Search Authority & Attribution-Driven Campaigns Win Budgets',
      executiveSummary:
        'Hiring managers shift spend from vanity impressions toward technical SEO, search-ready editorial content, and full-funnel conversion tracking.',
      trends: [
        {
          skill: 'Technical & Local SEO',
          category: 'Digital Marketing',
          demandLevel: 'High Demand',
          growthSignal: '+27% Organic Traffic Briefs',
          hourlyRateRange: '৳1,000–৳2,500/hr',
          summary: 'Core Web Vitals audits, structured schema markup, and bilingual keyword clusters.',
          searchKeyword: 'SEO',
        },
        {
          skill: 'Meta & Google Performance Ads',
          category: 'Digital Marketing',
          demandLevel: 'Surging',
          growthSignal: 'ROAS-Focused Scaling',
          hourlyRateRange: '৳1,100–৳2,600/hr',
          summary: 'Server-side pixel tracking and creative testing for e-commerce and lead gen.',
          searchKeyword: 'Digital Marketing',
        },
        {
          skill: 'B2B Content & Case Studies',
          category: 'Content Writing',
          demandLevel: 'High Demand',
          growthSignal: 'Subject-Matter Depth',
          hourlyRateRange: '৳800–৳2,000/hr',
          summary: 'Original customer proof, technical guides, and product documentation.',
          searchKeyword: 'Content Writing',
        },
        {
          skill: 'CRM & Email Lifecycle Flows',
          category: 'Digital Marketing',
          demandLevel: 'Steady Growth',
          growthSignal: 'Retention Automation',
          hourlyRateRange: '৳950–৳2,200/hr',
          summary: 'Automated onboarding, win-back sequences, and segmented newsletter funnels.',
          searchKeyword: 'Email Marketing',
        },
      ],
    },
    data: {
      topic: topic.label,
      headline: 'Workflow Automation & Clean Data Pipelines Save Team Hours',
      executiveSummary:
        'Growing businesses hire specialists to eliminate manual spreadsheet tasks through Python scripts, CRM syncs, and verified lead enrichment.',
      trends: [
        {
          skill: 'Python Scripting & Data Prep',
          category: 'Data Entry',
          demandLevel: 'Surging',
          growthSignal: '+39% Ops Automation Tasks',
          hourlyRateRange: '৳1,200–৳2,800/hr',
          summary: 'Cleaning messy CSV/ERP exports and building repeatable reporting scripts.',
          searchKeyword: 'Python',
        },
        {
          skill: 'No-Code & Webhook Automation',
          category: 'Web Development',
          demandLevel: 'Surging',
          growthSignal: '+46% SME Workflow Demand',
          hourlyRateRange: '৳1,100–৳2,500/hr',
          summary: 'Connecting forms, Slack, Google Sheets, and billing tools into hands-free pipelines.',
          searchKeyword: 'Automation',
        },
        {
          skill: 'BI Dashboards & SQL Reporting',
          category: 'Data Entry',
          demandLevel: 'High Demand',
          growthSignal: 'Executive Visibility',
          hourlyRateRange: '৳1,100–৳2,600/hr',
          summary: 'KPI dashboards tracking sales margins, fulfillment SLAs, and cohort retention.',
          searchKeyword: 'Data',
        },
        {
          skill: 'Verified Lead & Catalog Research',
          category: 'Data Entry',
          demandLevel: 'Steady Growth',
          growthSignal: 'High-Accuracy Enrichment',
          hourlyRateRange: '৳650–৳1,400/hr',
          summary: 'Structured B2B prospect lists and multi-marketplace SKU catalog uploads.',
          searchKeyword: 'Data Entry',
        },
      ],
    },
  };

  return presets[topic.id];
}
