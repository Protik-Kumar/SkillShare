import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_JOBS, SEED_PROFILES, SEED_SERVICES } from '../data/seedData';
import {
  DEFAULT_MAX_RATE,
  estimateJobHourlyRate,
  filterFreelancers,
  filterJobs,
  getProfileCategories,
  HOURLY_RATE_PRESETS,
  isRatePresetActive,
} from './marketplaceFilters';

test('getProfileCategories associates profiles via services and skill keywords', () => {
  const tanvir = SEED_PROFILES.find((p) => p.uid === 'freelancer-001')!;
  const farhana = SEED_PROFILES.find((p) => p.uid === 'freelancer-002')!;
  const nusrat = SEED_PROFILES.find((p) => p.uid === 'freelancer-004')!;

  assert.ok(getProfileCategories(tanvir, SEED_SERVICES).includes('Web Development'));
  assert.ok(getProfileCategories(farhana, SEED_SERVICES).includes('Graphic Design'));
  const nusratCats = getProfileCategories(nusrat, SEED_SERVICES);
  assert.ok(nusratCats.includes('Digital Marketing'));
  assert.ok(nusratCats.includes('Content Writing'));
});

test('filterFreelancers filters by selected skill categories and hourly rate range', () => {
  const webDevs = filterFreelancers(SEED_PROFILES, SEED_SERVICES, {
    query: '',
    selectedCategories: ['Web Development'],
    selectedLevel: 'All',
    minHourlyRate: 0,
    maxHourlyRate: DEFAULT_MAX_RATE,
    minRating: 0,
    selectedLocation: 'All',
  });
  assert.deepEqual(
    webDevs.map((p) => p.uid),
    ['freelancer-001', 'freelancer-005']
  );

  const midRate = filterFreelancers(SEED_PROFILES, SEED_SERVICES, {
    query: '',
    selectedCategories: [],
    selectedLevel: 'All',
    minHourlyRate: 1500,
    maxHourlyRate: 2000,
    minRating: 0,
    selectedLocation: 'All',
  });
  assert.deepEqual(
    midRate.map((p) => p.uid),
    ['freelancer-001', 'freelancer-002', 'freelancer-005']
  );
});

test('estimateJobHourlyRate derives consistent BDT/hr estimate from project budget', () => {
  const job1 = SEED_JOBS.find((j) => j.id === 'job-001')!; // 45000 => 2250/hr
  const job3 = SEED_JOBS.find((j) => j.id === 'job-003')!; // 18000 => 900/hr
  assert.equal(estimateJobHourlyRate(job1), 2250);
  assert.equal(estimateJobHourlyRate(job3), 900);
});

test('filterJobs filters by multiple categories, hourly rate range, and openOnly status', () => {
  const designAndVideo = filterJobs(SEED_JOBS, {
    query: '',
    selectedCategories: ['Graphic Design', 'Video Editing'],
    minHourlyRate: 0,
    maxHourlyRate: DEFAULT_MAX_RATE,
  });
  assert.deepEqual(
    designAndVideo.map((j) => j.id),
    ['job-002', 'job-003']
  );

  const highRateJobs = filterJobs(SEED_JOBS, {
    query: '',
    selectedCategories: [],
    minHourlyRate: 2000,
    maxHourlyRate: DEFAULT_MAX_RATE,
    openOnly: true,
  });
  // job-005 is in_progress (excluded by openOnly), leaving job-001 (2250/hr)
  assert.deepEqual(
    highRateJobs.map((j) => j.id),
    ['job-001']
  );
});

test('isRatePresetActive matches exact min/max bounds', () => {
  const preset = HOURLY_RATE_PRESETS.find((p) => p.id === '1500-2000')!;
  assert.equal(isRatePresetActive(preset, 1500, 2000), true);
  assert.equal(isRatePresetActive(preset, 1000, 2000), false);
});
