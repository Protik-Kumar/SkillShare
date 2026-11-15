import { Job, Profile, Service } from '../types';

export interface HourlyRatePreset {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const DEFAULT_MIN_RATE = 0;
export const DEFAULT_MAX_RATE = 4000;
export const ESTIMATED_PROJECT_HOURS = 20;

export const HOURLY_RATE_PRESETS: HourlyRatePreset[] = [
  { id: 'all', label: 'Any Rate', min: 0, max: DEFAULT_MAX_RATE },
  { id: 'under-1000', label: 'Under ৳1,000/hr', min: 0, max: 1000 },
  { id: '1000-1500', label: '৳1,000 – ৳1,500/hr', min: 1000, max: 1500 },
  { id: '1500-2000', label: '৳1,500 – ৳2,000/hr', min: 1500, max: 2000 },
  { id: '2000-plus', label: '৳2,000+/hr', min: 2000, max: DEFAULT_MAX_RATE },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Web Development': [
    'react', 'next.js', 'node.js', 'typescript', 'javascript', 'tailwind', 'postgresql',
    'firebase', 'rest api', 'graphql', 'flutter', 'dart', 'react native', 'android',
    'ios', 'full-stack', 'full stack', 'backend', 'frontend', 'web development', 'web app',
    'mobile engineer', 'mobile development', 'payment sdk',
  ],
  'Graphic Design': [
    'figma', 'ui/ux', 'ui design', 'ux', 'design system', 'wirefram', 'prototyp',
    'branding', 'brand identity', 'logo', 'graphic', 'product designer', 'illustration',
  ],
  'Content Writing': [
    'copywriting', 'content', 'blog', 'article', 'documentation', 'writer', 'bengali content',
  ],
  'Video Editing': [
    'premiere', 'after effects', 'davinci', 'color grading', 'sound design',
    'motion graphics', 'video', 'reels', 'youtube',
  ],
  'Digital Marketing': [
    'seo', 'marketing', 'google analytics', 'keyword research', 'facebook ads',
    'google ads', 'social media', 'growth',
  ],
  Translation: ['translation', 'translate', 'translator', 'bilingual', 'bengali', 'english'],
  'Data Entry': ['excel', 'data entry', 'scraping', 'spreadsheet', 'lead generation', 'research'],
  Tutoring: ['tutor', 'mentor', 'ielts', 'coaching', 'teaching'],
};

export function getProfileCategories(profile: Profile, services: Service[] = []): string[] {
  const matched = new Set<string>();

  for (const srv of services) {
    if (srv.freelancerId === profile.uid && srv.category) {
      matched.add(srv.category);
    }
  }

  const textPool = [profile.headline, ...profile.skills].join(' ').toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => textPool.includes(kw))) {
      matched.add(category);
    }
  }

  return Array.from(matched);
}

export function estimateJobHourlyRate(job: Job): number {
  if (!job || typeof job.budget !== 'number' || Number.isNaN(job.budget)) {
    return 0;
  }
  return Math.max(0, Math.round(job.budget / ESTIMATED_PROJECT_HOURS));
}

export interface FreelancerFilterCriteria {
  query: string;
  selectedCategories: string[];
  selectedLevel: string;
  minHourlyRate: number;
  maxHourlyRate: number;
  minRating: number;
  selectedLocation: string;
}

export function filterFreelancers(
  profiles: Profile[],
  services: Service[],
  criteria: FreelancerFilterCriteria
): Profile[] {
  const q = criteria.query.trim().toLowerCase();
  const minRate = Math.max(0, criteria.minHourlyRate || 0);
  const maxRate = criteria.maxHourlyRate >= DEFAULT_MAX_RATE ? Number.POSITIVE_INFINITY : criteria.maxHourlyRate;

  return profiles.filter((p) => {
    if (q) {
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesHeadline = p.headline.toLowerCase().includes(q);
      const matchesSkill = p.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchesName && !matchesHeadline && !matchesSkill) return false;
    }

    if (criteria.selectedCategories.length > 0) {
      const profileCats = getProfileCategories(p, services);
      const hasCategory = criteria.selectedCategories.some((cat) => profileCats.includes(cat));
      if (!hasCategory) return false;
    }

    if (criteria.selectedLevel !== 'All' && p.skillLevel !== criteria.selectedLevel) {
      return false;
    }

    if (p.hourlyRate < minRate || p.hourlyRate > maxRate) {
      return false;
    }

    if (p.rating < criteria.minRating) {
      return false;
    }

    if (
      criteria.selectedLocation !== 'All' &&
      !p.location.toLowerCase().includes(criteria.selectedLocation.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}

export interface JobFilterCriteria {
  query: string;
  selectedCategories: string[];
  minHourlyRate: number;
  maxHourlyRate: number;
  openOnly?: boolean;
}

export function filterJobs(jobs: Job[], criteria: JobFilterCriteria): Job[] {
  const q = criteria.query.trim().toLowerCase();
  const minRate = Math.max(0, criteria.minHourlyRate || 0);
  const maxRate = criteria.maxHourlyRate >= DEFAULT_MAX_RATE ? Number.POSITIVE_INFINITY : criteria.maxHourlyRate;

  return jobs.filter((j) => {
    if (j.status === 'cancelled' || j.status === 'flagged') return false;
    if (criteria.openOnly && j.status !== 'open') return false;

    if (q) {
      const matchesTitle = j.title.toLowerCase().includes(q);
      const matchesDesc = j.description.toLowerCase().includes(q);
      const matchesSkill = j.requiredSkills.some((s) => s.toLowerCase().includes(q));
      const matchesCategory = j.category.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesSkill && !matchesCategory) return false;
    }

    if (criteria.selectedCategories.length > 0 && !criteria.selectedCategories.includes(j.category)) {
      return false;
    }

    const hourlyEquivalent = estimateJobHourlyRate(j);
    if (hourlyEquivalent < minRate || hourlyEquivalent > maxRate) {
      return false;
    }

    return true;
  });
}

export function isRatePresetActive(preset: HourlyRatePreset, minRate: number, maxRate: number): boolean {
  return preset.min === minRate && preset.max === maxRate;
}
