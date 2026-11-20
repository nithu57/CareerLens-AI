// CareerLens AI - Core TypeScript Definitions

export type RoleType =
  | 'Full-Stack Developer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Flutter Developer'
  | 'Software Engineer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'AI Engineer'
  | 'Cloud Engineer'
  | 'Cybersecurity Analyst'
  | 'DevOps Engineer';

export type ExperienceLevel = 'Student / Fresher' | 'Entry Level (0-2 yrs)' | 'Mid Level (3-5 yrs)' | 'Senior (5+ yrs)';
export type WorkArrangement = 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  education?: string;
  experienceLevel?: ExperienceLevel;
  technicalSkills?: string[];
  targetRole?: RoleType;
  preferredLocation?: string;
  workArrangement?: WorkArrangement;
  weeklyHours?: number;
  careerGoals?: string;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  grade?: string;
}

export interface WorkExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
  technologiesUsed?: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year?: string;
  credentialUrl?: string;
}

export interface ExtractedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  education: EducationItem[];
  technicalSkills: string[];
  softSkills: string[];
  toolsAndFrameworks: string[];
  workExperience: WorkExperienceItem[];
  internships: WorkExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: string[];
}

export interface SkillCategoryBreakdown {
  matched: string[];
  needsImprovement: string[];
  missing: string[];
  requiresVerification: string[];
}

export interface ResumeAnalysisRecord {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string;
  extractedText: string;
  targetRole: RoleType;
  readinessScore: number;
  extractedData: ExtractedResumeData;
  skillBreakdown: SkillCategoryBreakdown;
  improvements: string[];
  isUserVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JobAnalysisRecord {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  createdAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string | null;
  description: string;
  redirectUrl: string;
  provider: 'Adzuna' | 'Direct' | 'CareerLens Verified';
  postedDate?: string;
  created?: string;
  retrievedAt: string;
  requiredSkills?: string[];
  contractType?: string;
  isRemote?: boolean;
}

export interface SavedJobRecord {
  id: string;
  userId: string;
  job: JobListing;
  matchScore?: number;
  savedAt: string;
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Archived';
  notes?: string;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  provider: 'YouTube' | 'Official Docs' | 'MDN' | 'Coursera' | 'freeCodeCamp' | 'Official';
  url: string;
  topic: string;
  type: 'video' | 'documentation' | 'interactive' | 'course';
  duration?: string;
  thumbnail?: string;
  channelTitle?: string;
  description?: string;
  isOfficial?: boolean;
}

export interface SavedResourceRecord {
  id: string;
  userId: string;
  resource: LearningResourceItem;
  savedAt: string;
  completed: boolean;
  completedAt?: string;
}

export interface PortfolioProjectSpec {
  title: string;
  description: string;
  deliverable: string;
  techStack: string[];
}

export interface RoadmapMilestone {
  id: string;
  userId: string;
  weekNumber: number;
  title: string;
  estimatedHours: number;
  objectives: string[];
  actionItems: string[];
  practicalExercises: string[];
  portfolioProject?: PortfolioProjectSpec;
  verifiedResources: LearningResourceItem[];
  completed: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export interface ChatMessageCitation {
  title: string;
  url: string;
  sourceType: 'job' | 'resource' | 'market_snapshot' | 'documentation';
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: ChatMessageCitation[];
  suggestedFollowUps?: string[];
  createdAt: string;
}

export interface MarketSnapshot {
  id: string;
  role: RoleType;
  location: string;
  sampleSize: number;
  topSkills: { name: string; percentage: number; demandScore: number }[];
  medianSalary?: number | null;
  salaryBands?: { level: string; min: number; max: number; median: number; currency: string }[];
  source: string;
  observationPeriod: string;
  lastRefreshed: string;
  isLive: boolean;
}

export interface ProviderHealth {
  provider: 'gemini' | 'adzuna' | 'youtube';
  name: string;
  status: 'operational' | 'degraded' | 'unconfigured';
  message: string;
  lastChecked: string;
}

export interface ConfidenceScoreHistoryItem {
  _id?: string;
  overallConfidenceScore: number;
  technicalSkillsScore: number;
  resumeScore: number;
  mockInterviewScore: number;
  roadmapProgressScore: number;
  educationExperienceScore: number;
  scoreChange: number;
  calculatedAt: string;
}

export interface ConfidenceScoreData {
  _id: string;
  firebaseUid: string;
  userId: string;
  overallConfidenceScore: number;
  technicalSkillsScore: number;
  resumeScore: number;
  mockInterviewScore: number;
  roadmapProgressScore: number;
  educationExperienceScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  previousScore: number;
  scoreChange: number;
  calculationMethod: string;
  lastCalculatedAt: string;
  history?: ConfidenceScoreHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

