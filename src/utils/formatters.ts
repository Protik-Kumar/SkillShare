import { Profile } from '../types';

/**
 * Format numbers into Bangladeshi Taka (৳).
 * e.g. 15000 -> "৳15,000"
 */
export function formatBDT(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return `৳${num.toLocaleString('en-IN')}`;
}

/**
 * Format date string or timestamp into DD MMM YYYY.
 * e.g. "2026-11-02T08:46:54Z" -> "02 Nov 2026"
 */
export function formatDate(dateVal: string | number | Date | null | undefined): string {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Calculate profile completion percentage based on key fields.
 * Returns an integer between 0 and 100.
 */
export function calculateProfileCompletion(profile?: Partial<Profile> | null): number {
  if (!profile) return 0;

  let points = 0;
  const total = 100;

  // Basic info (30 pts)
  if (profile.name?.trim()) points += 10;
  if (profile.headline?.trim()) points += 10;
  if (profile.bio && profile.bio.trim().length >= 20) points += 10;

  // Skills & rates (25 pts)
  if (profile.skills && profile.skills.length > 0) points += 15;
  if (profile.hourlyRate && profile.hourlyRate > 0) points += 10;

  // Location & contact (15 pts)
  if (profile.location?.trim()) points += 10;
  if (profile.phone?.trim()) points += 5;

  // Experience or Education (15 pts)
  if (profile.experience && profile.experience.length > 0) points += 8;
  if (profile.education && profile.education.length > 0) points += 7;

  // Portfolio items (15 pts)
  if (profile.portfolio && profile.portfolio.length > 0) points += 15;

  return Math.min(total, points);
}
