import { describe, it, expect, vi } from 'vitest';
import {
  normalizeTargetRole,
  ROLE_INTERVIEW_BANK,
  evaluateCandidateAnswer,
  askLensBot,
} from '@/services/lensBotService';
import { RoleType } from '@/types';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  setDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}));

describe('LensBot AI Service - Role-Specific Mock Interviews', () => {
  it('correctly normalizes roles from profile strings and prompt keywords', () => {
    expect(normalizeTargetRole('Data Scientist')).toBe('Data Scientist');
    expect(normalizeTargetRole(undefined, 'Conduct a mock interview for Data Science')).toBe('Data Scientist');
    expect(normalizeTargetRole(undefined, 'I want to interview for Frontend React role')).toBe('Frontend Developer');
    expect(normalizeTargetRole(undefined, 'Backend node api engineer')).toBe('Backend Developer');
    expect(normalizeTargetRole(undefined, 'Machine Learning and AI Engineer')).toBe('AI Engineer');
    expect(normalizeTargetRole(undefined, 'Cybersecurity SOC analyst')).toBe('Cybersecurity Analyst');
    expect(normalizeTargetRole(undefined, 'Flutter Dart mobile app developer')).toBe('Flutter Developer');
    expect(normalizeTargetRole(undefined, 'Unknown Random Role')).toBe('Software Engineer');
  });

  it('contains comprehensive interview questions and rubrics for all primary roles', () => {
    const roles: RoleType[] = [
      'Data Scientist',
      'Frontend Developer',
      'Backend Developer',
      'AI Engineer',
      'Data Analyst',
      'Cloud Engineer',
      'DevOps Engineer',
      'Cybersecurity Analyst',
      'Flutter Developer',
      'Full-Stack Developer',
      'Software Engineer',
    ];

    roles.forEach((role) => {
      const suite = ROLE_INTERVIEW_BANK[role];
      expect(suite).toBeDefined();
      expect(suite.round1.question).toBeTruthy();
      expect(suite.round1.rubric.length).toBeGreaterThan(0);
      expect(suite.round2.question).toBeTruthy();
      expect(suite.round2.rubric.length).toBeGreaterThan(0);
      expect(suite.algorithmicRound.problem).toBeTruthy();
    });
  });

  it('evaluates candidate answers and transitions to Round 2', () => {
    const evaluation = evaluateCandidateAnswer(
      'Data Scientist',
      'I would use PR-AUC instead of ROC-AUC because of severe class imbalance, and apply SMOTE strictly inside each cross-validation fold to prevent data leakage.'
    );

    expect(evaluation.feedback).toContain('Technical Evaluation & Critique');
    expect(evaluation.feedback).toContain('Data Scientist');
    expect(evaluation.feedback).toContain('Question 2');
    expect(evaluation.suggestedFollowUps.length).toBeGreaterThan(0);
  });

  it('generates role-specific questions for Data Scientist via askLensBot', async () => {
    const response = await askLensBot('test-user-1', 'Conduct a mock technical interview for my role as Data Scientist', {
      profile: {
        uid: 'test-user-1',
        email: 'test@example.com',
        displayName: 'Alice',
        targetRole: 'Data Scientist',
        onboardingCompleted: true,
      },
    });

    expect(response.content).toContain('Mock Technical Interview: Data Scientist');
    expect(response.content.toLowerCase()).toContain('imbalance');
    expect(response.content).toContain('PR-AUC');
    expect(response.suggestedFollowUps?.length).toBeGreaterThan(0);
  });

  it('generates role-specific questions for Frontend Developer via askLensBot', async () => {
    const response = await askLensBot('test-user-2', 'Start my mock interview', {
      profile: {
        uid: 'test-user-2',
        email: 'dev@example.com',
        displayName: 'Bob',
        targetRole: 'Frontend Developer',
        onboardingCompleted: true,
      },
    });

    expect(response.content).toContain('Mock Technical Interview: Frontend Developer');
    expect(response.content).toContain('Interaction to Next Paint');
    expect(response.content).toContain('DevTools');
  });

  it('serves coding/algorithmic problems when requested', async () => {
    const response = await askLensBot('test-user-3', 'Give me a coding algorithmic question for Flutter Developer', {
      profile: {
        uid: 'test-user-3',
        email: 'flutter@example.com',
        displayName: 'Charlie',
        targetRole: 'Flutter Developer',
        onboardingCompleted: true,
      },
    });

    expect(response.content).toContain('Algorithmic Coding Round: Flutter Developer');
    expect(response.content).toContain('LRU');
  });
});
