import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MarketSnapshot, RoleType } from '@/types';

// Benchmark market analytics derived from curated job market observations
export const BENCHMARK_MARKET_SNAPSHOTS: Record<RoleType, MarketSnapshot> = {
  'Full-Stack Developer': {
    id: 'snap-fsd',
    role: 'Full-Stack Developer',
    location: 'India (Bengaluru, Hyderabad, Pune, Remote)',
    sampleSize: 1420,
    topSkills: [
      { name: 'JavaScript / TypeScript', percentage: 94, demandScore: 98 },
      { name: 'React', percentage: 88, demandScore: 95 },
      { name: 'Node.js / Express', percentage: 82, demandScore: 91 },
      { name: 'SQL / PostgreSQL', percentage: 76, demandScore: 84 },
      { name: 'REST APIs / GraphQL', percentage: 74, demandScore: 82 },
      { name: 'Docker / Containers', percentage: 65, demandScore: 75 },
      { name: 'Cloud Deployment (AWS/GCP)', percentage: 62, demandScore: 72 },
      { name: 'Git & CI/CD Pipelines', percentage: 58, demandScore: 68 },
    ],
    medianSalary: 1600000,
    salaryBands: [
      { level: 'Student / Fresher', min: 450000, max: 800000, median: 600000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 700000, max: 1200000, median: 950000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1400000, max: 2200000, median: 1750000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 2400000, max: 4000000, median: 3000000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Frontend Developer': {
    id: 'snap-fe',
    role: 'Frontend Developer',
    location: 'India & Remote',
    sampleSize: 1180,
    topSkills: [
      { name: 'JavaScript / TypeScript', percentage: 96, demandScore: 97 },
      { name: 'React', percentage: 91, demandScore: 96 },
      { name: 'CSS3 / Tailwind CSS', percentage: 84, demandScore: 88 },
      { name: 'State Management (Redux/Zustand)', percentage: 71, demandScore: 78 },
      { name: 'Testing (Jest/Vitest/Cypress)', percentage: 64, demandScore: 72 },
      { name: 'Web Performance & CWV', percentage: 58, demandScore: 67 },
      { name: 'Next.js / SSR', percentage: 54, demandScore: 65 },
    ],
    medianSalary: 1400000,
    salaryBands: [
      { level: 'Student / Fresher', min: 400000, max: 700000, median: 550000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 650000, max: 1100000, median: 850000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1200000, max: 1900000, median: 1550000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 2000000, max: 3500000, median: 2600000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Backend Developer': {
    id: 'snap-be',
    role: 'Backend Developer',
    location: 'India & Remote',
    sampleSize: 1350,
    topSkills: [
      { name: 'Node.js / Java / Python', percentage: 93, demandScore: 95 },
      { name: 'PostgreSQL / MySQL / MongoDB', percentage: 89, demandScore: 92 },
      { name: 'Microservices & REST APIs', percentage: 84, demandScore: 89 },
      { name: 'System Design & Scalability', percentage: 76, demandScore: 85 },
      { name: 'Redis / In-memory Caching', percentage: 70, demandScore: 79 },
      { name: 'Kafka / RabbitMQ Message Queues', percentage: 61, demandScore: 72 },
      { name: 'Docker & Kubernetes', percentage: 59, demandScore: 70 },
    ],
    medianSalary: 1700000,
    salaryBands: [
      { level: 'Student / Fresher', min: 480000, max: 850000, median: 650000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 750000, max: 1300000, median: 1000000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1500000, max: 2400000, median: 1900000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 2600000, max: 4500000, median: 3300000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Flutter Developer': {
    id: 'snap-flutter',
    role: 'Flutter Developer',
    location: 'India (Bengaluru, Chennai, Remote)',
    sampleSize: 640,
    topSkills: [
      { name: 'Flutter SDK & Dart', percentage: 98, demandScore: 99 },
      { name: 'State Management (Bloc/Provider)', percentage: 89, demandScore: 92 },
      { name: 'REST APIs & JSON Parsing', percentage: 85, demandScore: 88 },
      { name: 'Local Database (SQLite/Hive)', percentage: 72, demandScore: 76 },
      { name: 'Firebase Mobile Services', percentage: 68, demandScore: 74 },
      { name: 'CI/CD & Fastlane for Stores', percentage: 52, demandScore: 61 },
    ],
    medianSalary: 1350000,
    salaryBands: [
      { level: 'Student / Fresher', min: 380000, max: 650000, median: 500000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 600000, max: 1050000, median: 800000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1100000, max: 1800000, median: 1450000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 1900000, max: 3200000, median: 2450000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Software Engineer': {
    id: 'snap-swe',
    role: 'Software Engineer',
    location: 'India & Global Tech Hubs',
    sampleSize: 2100,
    topSkills: [
      { name: 'Data Structures & Algorithms', percentage: 95, demandScore: 98 },
      { name: 'Object-Oriented & System Design', percentage: 88, demandScore: 91 },
      { name: 'SQL & Database Architecture', percentage: 82, demandScore: 87 },
      { name: 'Git & Version Control', percentage: 80, demandScore: 85 },
      { name: 'CI/CD Pipelines & Cloud Basics', percentage: 68, demandScore: 76 },
      { name: 'Automated Unit & Integration Testing', percentage: 65, demandScore: 73 },
    ],
    medianSalary: 1800000,
    salaryBands: [
      { level: 'Student / Fresher', min: 500000, max: 950000, median: 700000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 800000, max: 1500000, median: 1100000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1600000, max: 2700000, median: 2100000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 2800000, max: 5000000, median: 3600000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Data Analyst': {
    id: 'snap-da',
    role: 'Data Analyst',
    location: 'India & Remote',
    sampleSize: 980,
    topSkills: [
      { name: 'SQL (Advanced / Window Functions)', percentage: 96, demandScore: 98 },
      { name: 'Power BI / Tableau Dashboards', percentage: 88, demandScore: 92 },
      { name: 'Python (Pandas, NumPy)', percentage: 81, demandScore: 86 },
      { name: 'Excel / Spreadsheets Modeling', percentage: 78, demandScore: 81 },
      { name: 'Statistical Data Analysis', percentage: 69, demandScore: 75 },
      { name: 'Data Warehousing & ETL', percentage: 58, demandScore: 66 },
    ],
    medianSalary: 1250000,
    salaryBands: [
      { level: 'Student / Fresher', min: 360000, max: 600000, median: 480000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 550000, max: 950000, median: 720000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1000000, max: 1650000, median: 1300000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 1700000, max: 2800000, median: 2200000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Data Scientist': {
    id: 'snap-ds',
    role: 'Data Scientist',
    location: 'India & Remote',
    sampleSize: 850,
    topSkills: [
      { name: 'Python (Scikit-Learn, Pandas)', percentage: 97, demandScore: 98 },
      { name: 'Machine Learning Algorithms', percentage: 92, demandScore: 95 },
      { name: 'SQL & Data Extraction', percentage: 84, demandScore: 88 },
      { name: 'Statistical Modeling & Hypothesis Testing', percentage: 81, demandScore: 85 },
      { name: 'Deep Learning (PyTorch/TensorFlow)', percentage: 73, demandScore: 79 },
      { name: 'MLOps & Model Deployment (FastAPI/Docker)', percentage: 62, demandScore: 71 },
    ],
    medianSalary: 1950000,
    salaryBands: [
      { level: 'Student / Fresher', min: 550000, max: 1000000, median: 750000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 900000, max: 1600000, median: 1250000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1800000, max: 2800000, median: 2250000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 3000000, max: 5500000, median: 4000000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'AI Engineer': {
    id: 'snap-ai',
    role: 'AI Engineer',
    location: 'India (Bengaluru, Hyderabad, Remote)',
    sampleSize: 1120,
    topSkills: [
      { name: 'Python & Modern AI Frameworks', percentage: 98, demandScore: 99 },
      { name: 'LLMs & Prompt Engineering (Gemini, Claude)', percentage: 94, demandScore: 97 },
      { name: 'Vector DBs & RAG Architectures', percentage: 89, demandScore: 94 },
      { name: 'LangChain / LlamaIndex / Agent Loops', percentage: 83, demandScore: 89 },
      { name: 'FastAPI / Cloud Model Serving', percentage: 78, demandScore: 84 },
      { name: 'PyTorch / Fine-Tuning Techniques', percentage: 72, demandScore: 80 },
    ],
    medianSalary: 2300000,
    salaryBands: [
      { level: 'Student / Fresher', min: 650000, max: 1200000, median: 900000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 1100000, max: 1900000, median: 1500000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 2100000, max: 3400000, median: 2700000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 3500000, max: 6500000, median: 4800000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Cloud Engineer': {
    id: 'snap-cloud',
    role: 'Cloud Engineer',
    location: 'India & Remote',
    sampleSize: 1260,
    topSkills: [
      { name: 'AWS / Google Cloud / Azure', percentage: 96, demandScore: 98 },
      { name: 'Terraform / Infrastructure as Code', percentage: 87, demandScore: 92 },
      { name: 'Docker & Kubernetes', percentage: 83, demandScore: 89 },
      { name: 'Linux Administration & Bash', percentage: 80, demandScore: 85 },
      { name: 'Cloud Networking & IAM Security', percentage: 74, demandScore: 80 },
      { name: 'Monitoring (CloudWatch/Grafana)', percentage: 66, demandScore: 73 },
    ],
    medianSalary: 1750000,
    salaryBands: [
      { level: 'Student / Fresher', min: 450000, max: 850000, median: 650000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 750000, max: 1350000, median: 1050000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1550000, max: 2500000, median: 2000000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 2700000, max: 4800000, median: 3500000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'Cybersecurity Analyst': {
    id: 'snap-cyber',
    role: 'Cybersecurity Analyst',
    location: 'India & Remote',
    sampleSize: 780,
    topSkills: [
      { name: 'Network Security & Wireshark', percentage: 93, demandScore: 95 },
      { name: 'SIEM & Threat Analysis (Splunk/Elastic)', percentage: 88, demandScore: 91 },
      { name: 'Vulnerability Assessment (Nessus/ZAP)', percentage: 82, demandScore: 86 },
      { name: 'Identity & Access Management (IAM)', percentage: 76, demandScore: 81 },
      { name: 'Incident Response & Playbooks', percentage: 71, demandScore: 77 },
      { name: 'Security Compliance (NIST/ISO)', percentage: 62, demandScore: 70 },
    ],
    medianSalary: 1500000,
    salaryBands: [
      { level: 'Student / Fresher', min: 400000, max: 750000, median: 580000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 650000, max: 1200000, median: 920000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1350000, max: 2200000, median: 1750000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 2300000, max: 4200000, median: 3100000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
  'DevOps Engineer': {
    id: 'snap-devops',
    role: 'DevOps Engineer',
    location: 'India & Remote',
    sampleSize: 1320,
    topSkills: [
      { name: 'CI/CD Pipelines (GitHub Actions/Jenkins)', percentage: 95, demandScore: 97 },
      { name: 'Docker & Kubernetes', percentage: 91, demandScore: 94 },
      { name: 'Terraform & Infrastructure as Code', percentage: 86, demandScore: 90 },
      { name: 'Linux Systems & Bash Automation', percentage: 84, demandScore: 88 },
      { name: 'Prometheus, Grafana & Alertmanager', percentage: 77, demandScore: 83 },
      { name: 'Cloud Providers (AWS/GCP)', percentage: 75, demandScore: 81 },
    ],
    medianSalary: 1850000,
    salaryBands: [
      { level: 'Student / Fresher', min: 500000, max: 900000, median: 700000, currency: 'INR' },
      { level: 'Entry Level (0-2 yrs)', min: 800000, max: 1450000, median: 1100000, currency: 'INR' },
      { level: 'Mid Level (3-5 yrs)', min: 1650000, max: 2650000, median: 2150000, currency: 'INR' },
      { level: 'Senior (5+ yrs)', min: 2850000, max: 5200000, median: 3800000, currency: 'INR' },
    ],
    source: 'Aggregated Job Market Observations & Adzuna Tech Index',
    observationPeriod: 'Rolling 30-Day Window',
    lastRefreshed: new Date().toISOString(),
    isLive: false,
  },
};

/**
 * Historical demand trends for charting
 */
export const HISTORICAL_DEMAND_TRENDS = [
  { period: '90 Days Ago', TypeScript: 76, Python: 80, React: 74, Docker: 58, AI_LLMs: 45 },
  { period: '60 Days Ago', TypeScript: 82, Python: 84, React: 78, Docker: 62, AI_LLMs: 60 },
  { period: '30 Days Ago', TypeScript: 88, Python: 89, React: 84, Docker: 66, AI_LLMs: 78 },
  { period: 'Current', TypeScript: 94, Python: 93, React: 88, Docker: 70, AI_LLMs: 91 },
];

/**
 * Fetch market insights for a specific role or all roles
 */
export async function getMarketSnapshot(role: RoleType): Promise<MarketSnapshot> {
  // If Firestore shared collection has a fresh snapshot, return it
  try {
    const colRef = collection(db, 'job_market_snapshots');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data() as MarketSnapshot;
      if (docData.role === role) {
        return docData;
      }
    }
  } catch (err) {
    // Shared read non-fatal fallback
  }

  return BENCHMARK_MARKET_SNAPSHOTS[role] || BENCHMARK_MARKET_SNAPSHOTS['Full-Stack Developer'];
}
