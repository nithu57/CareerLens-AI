import { describe, it, expect } from 'vitest';
import { calculateReadinessScore, ROLE_COMPETENCY_WEIGHTS } from '@/services/resumeService';
import { RoleType } from '@/types';

describe('Readiness Score Engine (calculateReadinessScore)', () => {
  it('should calculate 100% readiness when all competencies for a role are matched', () => {
    const role: RoleType = 'Full-Stack Developer';
    const competencies = Object.keys(ROLE_COMPETENCY_WEIGHTS[role]);

    const result = calculateReadinessScore(role, competencies, []);
    expect(result.score).toBe(100);
    expect(result.matchedWeight).toBe(result.totalWeight);
    expect(result.breakdown.every((item) => item.status === 'matched')).toBe(true);
  });

  it('should calculate minimum baseline score when no competencies are matched', () => {
    const role: RoleType = 'Full-Stack Developer';
    const result = calculateReadinessScore(role, ['Unrelated Skill', 'Gardening'], []);
    
    // In our algorithm, score is clamped at minimum 10
    expect(result.score).toBe(10);
    expect(result.matchedWeight).toBe(0);
    expect(result.breakdown.every((item) => item.status === 'missing')).toBe(true);
  });

  it('should award 50% partial credit for competencies needing improvement', () => {
    const role: RoleType = 'Frontend Developer';
    const competencies = Object.keys(ROLE_COMPETENCY_WEIGHTS[role]);
    const firstSkill = competencies[0];
    const skillWeight = ROLE_COMPETENCY_WEIGHTS[role][firstSkill];

    const result = calculateReadinessScore(role, [], [firstSkill]);
    
    expect(result.matchedWeight).toBe(skillWeight * 0.5);
    const item = result.breakdown.find((b) => b.skill === firstSkill);
    expect(item?.status).toBe('needs_improvement');
  });

  it('should handle case-insensitivity and substring matching gracefully', () => {
    const role: RoleType = 'Data Analyst';
    // Competency contains 'SQL & Complex Queries'
    const result = calculateReadinessScore(role, ['sql'], []);
    const sqlItem = result.breakdown.find((b) => b.skill.toLowerCase().includes('sql'));
    expect(sqlItem?.status).toBe('matched');
  });

  it('should support all 11 standardized target roles', () => {
    const roles: RoleType[] = [
      'Full-Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Flutter Developer',
      'Software Engineer',
      'Data Analyst',
      'Data Scientist',
      'AI Engineer',
      'Cloud Engineer',
      'Cybersecurity Analyst',
      'DevOps Engineer',
    ];

    roles.forEach((role) => {
      expect(ROLE_COMPETENCY_WEIGHTS[role]).toBeDefined();
      const weights = Object.values(ROLE_COMPETENCY_WEIGHTS[role]);
      expect(weights.length).toBeGreaterThanOrEqual(8);
      const total = weights.reduce((acc, w) => acc + w, 0);
      expect(total).toBeGreaterThan(0);

      const res = calculateReadinessScore(role, ['Python', 'SQL', 'Git'], []);
      expect(res.score).toBeGreaterThanOrEqual(10);
      expect(res.score).toBeLessThanOrEqual(100);
      expect(res.totalWeight).toBe(total);
    });
  });
});
