import { describe, it, expect } from 'vitest';
import { ROLE_CURRICULUM_TEMPLATES } from '@/services/roadmapService';
import { RoleType } from '@/types';

describe('Personalized Roadmap Curriculum (roadmapService)', () => {
  const supportedRoles: RoleType[] = [
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

  it('should have comprehensive curriculum defined for all 11 target roles', () => {
    supportedRoles.forEach((role) => {
      const curriculum = ROLE_CURRICULUM_TEMPLATES[role];
      expect(curriculum, `Missing curriculum for role: ${role}`).toBeDefined();
      expect(curriculum.length).toBeGreaterThanOrEqual(4);
      expect(curriculum.length).toBeLessThanOrEqual(8);
    });
  });

  it('should enforce complete milestone specifications for each week', () => {
    supportedRoles.forEach((role) => {
      const curriculum = ROLE_CURRICULUM_TEMPLATES[role];
      curriculum.forEach((week, index) => {
        const weekNum = index + 1;
        expect(week.title, `Empty title for ${role} week ${weekNum}`).toBeTruthy();
        expect(week.objectives.length, `Missing objectives for ${role} week ${weekNum}`).toBeGreaterThan(0);
        expect(week.actionItems.length, `Missing action items for ${role} week ${weekNum}`).toBeGreaterThan(0);
        expect(week.practicalExercises.length, `Missing exercises for ${role} week ${weekNum}`).toBeGreaterThan(0);
        
        // Portfolio project specification
        expect(week.portfolioProject.title).toBeTruthy();
        expect(week.portfolioProject.description).toBeTruthy();
        expect(week.portfolioProject.deliverable).toBeTruthy();
        expect(week.portfolioProject.techStack.length).toBeGreaterThan(0);

        // Verified resources
        expect(week.verifiedResources.length).toBeGreaterThan(0);
        week.verifiedResources.forEach((res) => {
          expect(res.id).toBeTruthy();
          expect(res.title).toBeTruthy();
          expect(res.url).toMatch(/^https?:\/\//);
          expect(['video', 'documentation', 'interactive', 'course']).toContain(res.type);
        });
      });
    });
  });
});
