import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEscrowBreakdown, canTransitionOrderStatus } from './escrow';
import { formatBDT, formatDate, calculateProfileCompletion } from './formatters';
import { calculateKeywordSkillMatch } from './matching';

test('calculateEscrowBreakdown computes 10% commission correctly', () => {
  const result = calculateEscrowBreakdown(10000, 10);
  assert.equal(result.totalAmount, 10000);
  assert.equal(result.commissionAmount, 1000);
  assert.equal(result.freelancerEarnings, 9000);
});

test('calculateEscrowBreakdown handles 0 or negative gracefully', () => {
  const result = calculateEscrowBreakdown(-500, 10);
  assert.equal(result.totalAmount, 0);
  assert.equal(result.commissionAmount, 0);
  assert.equal(result.freelancerEarnings, 0);
});

test('canTransitionOrderStatus enforces proper role-based flow', () => {
  // Freelancer delivering work
  assert.equal(canTransitionOrderStatus('In Progress', 'Delivered', 'freelancer'), true);
  // Freelancer cannot complete order themselves
  assert.equal(canTransitionOrderStatus('Delivered', 'Completed', 'freelancer'), false);
  // Client can approve delivery to complete order
  assert.equal(canTransitionOrderStatus('Delivered', 'Completed', 'client'), true);
  // Client can request revision
  assert.equal(canTransitionOrderStatus('Delivered', 'Revision', 'client'), true);
  // Admin can transition anywhere
  assert.equal(canTransitionOrderStatus('Completed', 'Cancelled', 'admin'), true);
});

test('formatBDT formats in Bangladeshi Taka', () => {
  assert.equal(formatBDT(15000), '৳15,000');
  assert.equal(formatBDT(0), '৳0');
});

test('formatDate formats into DD MMM YYYY', () => {
  const dateStr = new Date(2026, 10, 2).toISOString(); // Nov 02 2026
  assert.equal(formatDate(dateStr), '02 Nov 2026');
});

test('calculateProfileCompletion calculates reasonable percentage', () => {
  const empty = calculateProfileCompletion({});
  assert.equal(empty, 0);

  const full = calculateProfileCompletion({
    name: 'Tanvir',
    headline: 'Full Stack Engineer',
    bio: 'Experienced web developer with 5 years experience in building high scale apps.',
    location: 'Dhaka',
    phone: '+8801700000000',
    skills: ['React', 'Node.js', 'Firebase'],
    hourlyRate: 1500,
    education: [{ id: '1', degree: 'BSc CSE', institution: 'BUET', year: '2023' }],
    experience: [{ id: '1', role: 'Dev', company: 'Tech', period: '2 yrs' }],
    portfolio: [{ id: '1', title: 'App', imageUrl: 'https://example.com' }],
  });
  assert.equal(full, 100);
});

test('calculateKeywordSkillMatch computes matching score', () => {
  const match = calculateKeywordSkillMatch(
    ['React', 'TypeScript', 'Node.js', 'Tailwind'],
    ['React', 'Tailwind CSS', 'Next.js']
  );
  // React matches, Tailwind matches partially (target 'tailwind' matches candidate 'tailwind css') -> 2/4 = 50%
  assert.equal(match, 50);
});
