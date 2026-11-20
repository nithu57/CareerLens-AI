import { describe, it, expect } from 'vitest';
import { validateResumeFile, parseResumeTextHeuristic } from '@/services/resumeService';

describe('Resume Parsing & Validation (resumeService)', () => {
  describe('validateResumeFile', () => {
    it('should reject null or undefined file', () => {
      const result = validateResumeFile(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No file selected');
    });

    it('should reject non-PDF file formats', () => {
      const file = new File(['dummy content'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Only PDF');
    });

    it('should reject files exceeding 10MB limit', () => {
      // 11MB file
      const bigBuffer = new Uint8Array(11 * 1024 * 1024);
      const file = new File([bigBuffer], 'heavy_resume.pdf', { type: 'application/pdf' });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum limit of 10MB');
    });

    it('should accept valid PDF files under 10MB', () => {
      const file = new File(['%PDF-1.4 sample content'], 'my_resume.pdf', { type: 'application/pdf' });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('parseResumeTextHeuristic', () => {
    it('should extract identified technical and soft skills from resume text', () => {
      const sampleText = `
        Jane Doe
        Software Engineer with experience in React, TypeScript, Node.js, and PostgreSQL.
        Strong problem solving and team leadership skills.
        Led agile teams and built CI/CD pipelines using Docker and GitHub Actions.
        Education: Bachelor of Technology in Computer Science.
      `;

      const result = parseResumeTextHeuristic(sampleText, 'Full-Stack Developer');

      expect(result.extractedData.technicalSkills).toContain('React');
      expect(result.extractedData.technicalSkills).toContain('TypeScript');
      expect(result.extractedData.technicalSkills).toContain('Node.js');
      expect(result.extractedData.technicalSkills).toContain('PostgreSQL');
      expect(result.extractedData.technicalSkills).toContain('Docker');

      expect(result.extractedData.softSkills).toContain('Problem Solving');
      expect(result.extractedData.softSkills).toContain('Leadership');

      expect(result.skillBreakdown.matched.length).toBeGreaterThan(0);
      expect(result.readinessScore).toBeGreaterThanOrEqual(10);
      expect(result.readinessScore).toBeLessThanOrEqual(100);
    });

    it('should provide actionable improvement suggestions for thin resumes', () => {
      const emptyText = 'Bob Smith, Student looking for work.';
      const result = parseResumeTextHeuristic(emptyText, 'Frontend Developer');

      expect(result.improvements.length).toBeGreaterThan(0);
      expect(result.skillBreakdown.missing.length).toBeGreaterThan(0);
    });
  });
});
