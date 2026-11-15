/**
 * Skill matching utilities for matching jobs with candidates.
 */

export function calculateKeywordSkillMatch(
  jobSkills: string[],
  candidateSkills: string[]
): number {
  if (!jobSkills || jobSkills.length === 0) return 0;
  if (!candidateSkills || candidateSkills.length === 0) return 0;

  const normalizedCandidate = candidateSkills.map((s) => s.trim().toLowerCase());
  let matches = 0;

  for (const skill of jobSkills) {
    const target = skill.trim().toLowerCase();
    if (normalizedCandidate.some((c) => c === target || c.includes(target) || target.includes(c))) {
      matches += 1;
    }
  }

  const percentage = Math.round((matches / jobSkills.length) * 100);
  return Math.min(100, percentage);
}
