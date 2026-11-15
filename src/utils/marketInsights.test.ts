import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInsightsPrompt,
  extractGroundingSources,
  formatGeminiErrorMessage,
  parseGroundedInsightsText,
  getTopicById,
} from './marketInsights';

test('getTopicById falls back to default topic when unknown', () => {
  const defaultTopic = getTopicById('unknown-id');
  assert.equal(defaultTopic.id, 'all');
  const designTopic = getTopicById('design');
  assert.equal(designTopic.label, 'UI/UX & Design');
});

test('buildInsightsPrompt embeds selected topic and year', () => {
  const prompt = buildInsightsPrompt('web-ai', new Date('2026-11-15T00:00:00Z'));
  assert.match(prompt, /Web & AI Engineering/);
  assert.match(prompt, /2026/);
  assert.match(prompt, /Google Search/);
});

test('extractGroundingSources deduplicates URIs, filters invalid protocols, and extracts domain', () => {
  const metadata = {
    webSearchQueries: ['top freelance skills 2026', ''],
    groundingChunks: [
      { web: { uri: 'https://www.upwork.com/research/2026-skills', title: 'Upwork 2026 Skills Report' } },
      { web: { uri: 'https://www.upwork.com/research/2026-skills', title: 'Duplicate Entry' } },
      { web: { uri: 'https://blog.github.com/ai-trends', title: '' } },
      { web: { uri: 'javascript:alert(1)', title: 'Bad Protocol' } },
      { web: {} },
    ],
  };

  const result = extractGroundingSources(metadata);
  assert.equal(result.sources.length, 2);
  assert.deepEqual(result.sources[0], {
    title: 'Upwork 2026 Skills Report',
    uri: 'https://www.upwork.com/research/2026-skills',
    domain: 'upwork.com',
  });
  assert.deepEqual(result.sources[1], {
    title: 'blog.github.com',
    uri: 'https://blog.github.com/ai-trends',
    domain: 'blog.github.com',
  });
  assert.deepEqual(result.searchQueries, ['top freelance skills 2026']);
});

test('parseGroundedInsightsText parses fenced JSON payload cleanly', () => {
  const raw = `Here is the summary:
\`\`\`json
{
  "headline": "AI Workflow Engineers See Record Retainers",
  "executiveSummary": "Clients are prioritizing automation and full-stack product delivery.",
  "trends": [
    {
      "skill": "Next.js & TypeScript",
      "category": "Web Development",
      "demandLevel": "Surging",
      "growthSignal": "+42% YoY job posts",
      "hourlyRateRange": "৳1,600–৳3,400/hr",
      "summary": "Fast web portals with integrated payment flows.",
      "searchKeyword": "Next.js"
    }
  ]
}
\`\`\``;

  const parsed = parseGroundedInsightsText(raw, 'web-ai');
  assert.equal(parsed.headline, 'AI Workflow Engineers See Record Retainers');
  assert.equal(parsed.trends.length, 1);
  assert.equal(parsed.trends[0].demandLevel, 'Surging');
  assert.equal(parsed.trends[0].searchKeyword, 'Next.js');
});

test('parseGroundedInsightsText falls back gracefully for markdown bullet output', () => {
  const raw = `
Demand for product designers remains robust this quarter.

- **Figma Design Systems**: Teams are requesting multi-brand component tokens.
- **Mobile Checkout UX**: Higher emphasis on bKash and one-tap flows.
`;

  const parsed = parseGroundedInsightsText(raw, 'design');
  assert.equal(parsed.trends.length, 2);
  assert.equal(parsed.trends[0].skill, 'Figma Design Systems');
  assert.match(parsed.trends[0].summary, /component tokens/);
});

test('parseGroundedInsightsText falls back cleanly on empty text', () => {
  const parsed = parseGroundedInsightsText('', 'marketing');
  assert.equal(parsed.topic, 'Marketing & SEO');
  assert.equal(parsed.trends.length, 4);
});

test('formatGeminiErrorMessage parses Gemini JSON 429 error cleanly', () => {
  const rawErr = new Error(
    JSON.stringify({
      error: {
        code: 429,
        message: 'You exceeded your current quota, please check your plan and billing details.',
        status: 'RESOURCE_EXHAUSTED',
      },
    })
  );
  const formatted = formatGeminiErrorMessage(rawErr);
  assert.equal(formatted.status, 429);
  assert.doesNotMatch(formatted.message, /\{/);
  assert.match(formatted.message, /quota/i);
});

