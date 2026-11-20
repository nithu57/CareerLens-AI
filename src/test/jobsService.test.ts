import { describe, it, expect } from 'vitest';
import { BENCHMARK_MARKET_JOBS, searchJobs } from '@/services/jobsService';

describe('Job Market Discovery (jobsService)', () => {
  it('should have properly structured benchmark job listings', () => {
    expect(BENCHMARK_MARKET_JOBS.length).toBeGreaterThanOrEqual(6);

    BENCHMARK_MARKET_JOBS.forEach((job) => {
      expect(job.id).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.company).toBeTruthy();
      expect(job.location).toBeTruthy();
      expect(job.description).toBeTruthy();
      expect(job.redirectUrl).toMatch(/^https?:\/\//);
      expect(Array.isArray(job.requiredSkills)).toBe(true);
      expect(job.requiredSkills?.length).toBeGreaterThan(0);
      expect(job.provider).toBeTruthy();
      expect(job.retrievedAt).toBeTruthy();
    });
  });

  it('should filter jobs accurately by keyword in title, company, or skills', async () => {
    const result = await searchJobs({ keywords: 'React' });
    expect(result.jobs.length).toBeGreaterThan(0);
    
    // Every filtered job should mention react somewhere
    const allMatch = result.jobs.every((j) => {
      const matchInTitle = j.title.toLowerCase().includes('react');
      const matchInDesc = j.description.toLowerCase().includes('react');
      const matchInSkills = (j.requiredSkills || []).some((s) => s.toLowerCase().includes('react'));
      return matchInTitle || matchInDesc || matchInSkills;
    });
    expect(allMatch).toBe(true);
  });

  it('should filter jobs by location (e.g. Bengaluru, Hyderabad, Pune, Chennai, Mumbai)', async () => {
    const result = await searchJobs({ location: 'Bengaluru' });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) => j.location.toLowerCase().includes('bengaluru'))).toBe(true);
  });

  it('should filter jobs by remote work arrangement', async () => {
    const result = await searchJobs({ isRemote: true });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs.every((j) => j.isRemote)).toBe(true);
  });

  it('should clearly identify the data source and total results count', async () => {
    const result = await searchJobs({});
    expect(result.totalResults).toBe(result.jobs.length);
    expect(['Adzuna API', 'Verified Market Benchmarks']).toContain(result.source);
  });
});
