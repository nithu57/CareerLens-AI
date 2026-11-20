import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ResumeAnalysisRecord, ExtractedResumeData, RoleType, SkillCategoryBreakdown } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validate PDF file before attempting upload
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return { valid: false, error: 'Only PDF documents (.pdf) are supported.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum limit of 10MB.' };
  }
  return { valid: true };
}

/**
 * Upload resume PDF to Firebase Cloud Storage with progress updates
 */
export async function uploadResumeToStorage(
  userId: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<{ fileUrl: string; storagePath: string }> {
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `resumes/${userId}/${Date.now()}_${sanitizedFileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    let isSettled = false;
    let uploadTask: ReturnType<typeof uploadBytesResumable> | null = null;

    // Timeout protection: 30s max for upload, refreshed on progress
    let timeoutId = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try {
          if (uploadTask) uploadTask.cancel();
        } catch (_) {}
        reject(
          new Error(
            'Firebase Cloud Storage upload timed out. Please check your storage rules or network connection.'
          )
        );
      }
    }, 30000);

    try {
      uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/pdf',
        customMetadata: {
          userId,
          originalName: file.name,
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Reset timeout on active byte transfers
          if (!isSettled) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              if (!isSettled) {
                isSettled = true;
                try {
                  if (uploadTask) uploadTask.cancel();
                } catch (_) {}
                reject(new Error('Firebase Cloud Storage upload stalled.'));
              }
            }, 30000);
          }
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(percent);
        },
        (error) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timeoutId);
            console.warn('Storage upload error:', error);
            reject(error);
          }
        },
        async () => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timeoutId);
            try {
              const downloadUrl = await getDownloadURL(uploadTask!.snapshot.ref);
              resolve({ fileUrl: downloadUrl, storagePath });
            } catch (err) {
              reject(err);
            }
          }
        }
      );
    } catch (initErr) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timeoutId);
        reject(initErr);
      }
    }
  });
}

/**
 * Extracts plain text from a client-provided PDF File using PDF.js
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageStrings + '\n';
  }

  return fullText.trim();
}

/**
 * Benchmark competencies for standard technology roles to calculate explainable readiness
 */
export const ROLE_COMPETENCY_WEIGHTS: Record<RoleType, Record<string, number>> = {
  'Full-Stack Developer': {
    'JavaScript/TypeScript': 5,
    'React': 5,
    'Node.js': 5,
    'REST APIs / GraphQL': 4,
    'SQL / NoSQL Databases': 4,
    'Git & Version Control': 3,
    'HTML/CSS & Responsive Design': 3,
    'Cloud Deployment (AWS/GCP/Firebase)': 3,
    'Docker / Containers': 2,
    'Testing (Unit/Integration)': 2,
  },
  'Frontend Developer': {
    'JavaScript/TypeScript': 5,
    'React / Modern Frameworks': 5,
    'HTML5 & Semantic Markup': 4,
    'CSS3 / Tailwind / Responsive Design': 4,
    'State Management': 3,
    'Performance Optimization & CWV': 3,
    'Git & Version Control': 3,
    'Testing (Jest/Vitest/Playwright)': 3,
    'REST APIs & Asynchronous JS': 3,
    'Web Accessibility (WCAG)': 2,
  },
  'Backend Developer': {
    'Node.js / Python / Java / Go': 5,
    'Database Design (SQL/NoSQL)': 5,
    'RESTful APIs & Microservices': 4,
    'Authentication & Security': 4,
    'System Architecture & Caching': 3,
    'Docker & CI/CD': 3,
    'Git & Version Control': 3,
    'Cloud Services (AWS/GCP)': 3,
    'Testing & Profiling': 3,
    'Message Queues (Kafka/RabbitMQ)': 2,
  },
  'Flutter Developer': {
    'Dart Language': 5,
    'Flutter Framework & Widgets': 5,
    'State Management (Provider/Bloc/Riverpod)': 4,
    'REST API Integration': 4,
    'Local Persistence (SQLite/Hive)': 3,
    'Responsive & Adaptive Layouts': 3,
    'Git & Version Control': 3,
    'Platform Channels & Native Interop': 2,
    'App Store & Play Store Deployment': 2,
    'Automated Testing': 2,
  },
  'Software Engineer': {
    'Data Structures & Algorithms': 5,
    'Object-Oriented & Functional Design': 4,
    'Git & Collaborative Workflows': 4,
    'Relational or NoSQL Databases': 4,
    'API Design & Integration': 3,
    'Clean Code & Code Reviews': 3,
    'CI/CD Pipelines': 3,
    'Debugging & Performance Profiling': 3,
    'Automated Unit Testing': 3,
    'Cloud Fundamentals': 2,
  },
  'Data Analyst': {
    'SQL & Complex Queries': 5,
    'Excel / Spreadsheets': 4,
    'Data Visualization (Tableau/PowerBI)': 4,
    'Python or R (Pandas/NumPy)': 4,
    'Statistical Analysis': 3,
    'Data Cleaning & Preprocessing': 3,
    'Business Intelligence & Reporting': 3,
    'Storytelling with Data': 3,
    'Git & Reproducibility': 2,
    'Database Warehousing': 2,
  },
  'Data Scientist': {
    'Python (NumPy, Pandas, Scikit-Learn)': 5,
    'Statistical Modeling & Probability': 5,
    'Machine Learning Algorithms': 5,
    'SQL & Data Manipulation': 4,
    'Data Visualization': 3,
    'Deep Learning (PyTorch/TensorFlow)': 3,
    'Feature Engineering': 3,
    'Experiment Design & A/B Testing': 3,
    'Model Evaluation & Validation': 3,
    'MLOps & Deployment': 2,
  },
  'AI Engineer': {
    'Python & Modern ML Toolkits': 5,
    'LLMs & Prompt Engineering': 5,
    'LangChain / LlamaIndex / Agent Frameworks': 4,
    'Vector Databases & Embeddings (RAG)': 4,
    'Fine-tuning & Evaluation': 4,
    'APIs & Cloud Model Serving': 4,
    'PyTorch or JAX': 3,
    'Data Pipelines & Tokenization': 3,
    'System Design for AI': 3,
    'AI Safety & Guardrails': 2,
  },
  'Cloud Engineer': {
    'AWS / Google Cloud / Azure': 5,
    'Infrastructure as Code (Terraform)': 4,
    'Linux / Shell Scripting': 4,
    'Docker & Kubernetes': 4,
    'Networking & Security (VPC, IAM)': 4,
    'CI/CD Automation': 3,
    'Monitoring & Logging (Prometheus/Grafana)': 3,
    'Cost Optimization': 3,
    'High Availability & Disaster Recovery': 3,
    'Database Management': 2,
  },
  'Cybersecurity Analyst': {
    'Network Security & Protocols': 5,
    'Vulnerability Assessment & Scanning': 4,
    'SIEM & Log Analysis': 4,
    'Threat Detection & Incident Response': 4,
    'Security Frameworks (NIST/ISO)': 3,
    'Identity & Access Management (IAM)': 3,
    'Linux & Windows Security': 3,
    'Penetration Testing Basics': 3,
    'Cryptography Fundamentals': 3,
    'Security Compliance': 2,
  },
  'DevOps Engineer': {
    'Linux Administration & Bash': 5,
    'CI/CD (GitHub Actions/GitLab/Jenkins)': 5,
    'Docker & Container Orchestration (K8s)': 5,
    'Infrastructure as Code (Terraform/Ansible)': 4,
    'Cloud Providers (AWS/GCP)': 4,
    'Monitoring & Observability': 3,
    'Git Workflows & Branching': 3,
    'Security & DevSecOps': 3,
    'Networking & DNS': 3,
    'Python or Go Scripting': 2,
  },
};

/**
 * Calculates an explainable, weighted readiness score:
 * Readiness Score = (Weighted Matched Competencies / Total Required Competency Weight) * 100
 */
export function calculateReadinessScore(
  targetRole: RoleType,
  matchedSkills: string[],
  needsImprovementSkills: string[]
): { score: number; totalWeight: number; matchedWeight: number; breakdown: { skill: string; weight: number; status: string }[] } {
  const competencies = ROLE_COMPETENCY_WEIGHTS[targetRole] || ROLE_COMPETENCY_WEIGHTS['Software Engineer'];
  let totalWeight = 0;
  let matchedWeight = 0;
  const breakdown: { skill: string; weight: number; status: string }[] = [];

  const normalizedMatched = new Set(matchedSkills.map((s) => s.toLowerCase().trim()));
  const normalizedNeedsImp = new Set(needsImprovementSkills.map((s) => s.toLowerCase().trim()));

  for (const [skill, weight] of Object.entries(competencies)) {
    totalWeight += weight;
    const lowerSkill = skill.toLowerCase();
    
    // Check if matched directly or via substring
    const isMatched = Array.from(normalizedMatched).some(
      (m) => lowerSkill.includes(m) || m.includes(lowerSkill)
    );
    const isNeedsImp = Array.from(normalizedNeedsImp).some(
      (n) => lowerSkill.includes(n) || n.includes(lowerSkill)
    );

    if (isMatched) {
      matchedWeight += weight;
      breakdown.push({ skill, weight, status: 'matched' });
    } else if (isNeedsImp) {
      // Partial credit (50%) for competencies in progress or needing improvement
      matchedWeight += weight * 0.5;
      breakdown.push({ skill, weight, status: 'needs_improvement' });
    } else {
      breakdown.push({ skill, weight, status: 'missing' });
    }
  }

  const rawScore = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 50;
  const score = Math.min(100, Math.max(10, Math.round(rawScore)));

  return { score, totalWeight, matchedWeight, breakdown };
}

/**
 * Client parser for raw resume text to extract preliminary structured data
 */
export function parseResumeTextHeuristic(
  text: string,
  targetRole: RoleType
): { extractedData: ExtractedResumeData; skillBreakdown: SkillCategoryBreakdown; improvements: string[]; readinessScore: number } {
  const lower = text.toLowerCase();

  // Common technical skills library
  const knownTechSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'HTML', 'CSS', 'Tailwind', 'Next.js', 'Express', 'Django', 'Flask', 'Spring Boot',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Firestore', 'AWS',
    'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'CI/CD', 'REST APIs',
    'GraphQL', 'Linux', 'Flutter', 'Dart', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy',
    'Tableau', 'PowerBI', 'Figma', 'Jest', 'Vitest', 'Cypress', 'Kafka', 'Terraform'
  ];

  const knownSoftSkills = [
    'Communication', 'Team Collaboration', 'Problem Solving', 'Critical Thinking',
    'Adaptability', 'Time Management', 'Agile Methodology', 'Leadership', 'Work Ethic'
  ];

  const matchedTech: string[] = [];
  knownTechSkills.forEach((tech) => {
    // Regex word boundary search
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      matchedTech.push(tech);
    }
  });

  const matchedSoft: string[] = [];
  knownSoftSkills.forEach((soft) => {
    const regex = new RegExp(`\\b${soft.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      matchedSoft.push(soft);
    }
  });

  // Target role specific required skills check
  const roleWeights = ROLE_COMPETENCY_WEIGHTS[targetRole] || ROLE_COMPETENCY_WEIGHTS['Software Engineer'];
  const matchedCompetencies: string[] = [];
  const missingCompetencies: string[] = [];

  Object.keys(roleWeights).forEach((comp) => {
    const compLower = comp.toLowerCase();
    const isPresent = matchedTech.some((t) => compLower.includes(t.toLowerCase())) || compLower.split(/[/&,]/).some((part) => lower.includes(part.trim()));
    if (isPresent) {
      matchedCompetencies.push(comp);
    } else {
      missingCompetencies.push(comp);
    }
  });

  const readiness = calculateReadinessScore(targetRole, matchedCompetencies, []);

  const improvements: string[] = [];
  if (missingCompetencies.length > 0) {
    improvements.push(`Focus on demonstrating competency in: ${missingCompetencies.slice(0, 3).join(', ')}.`);
  }
  if (!text.toLowerCase().includes('github.com') && !text.toLowerCase().includes('gitlab.com')) {
    improvements.push('Include accessible links to GitHub or live deployed portfolio projects.');
  }
  if (!/\b(improved|optimized|achieved|reduced|increased|developed|architected)\b/i.test(text)) {
    improvements.push('Use active achievement verbs and quantifiable metrics (e.g., "reduced latency by 30%") in experience descriptions.');
  }

  const extractedData: ExtractedResumeData = {
    education: [
      {
        institution: 'University / College',
        degree: text.includes('Bachelor') || text.includes('B.Tech') ? 'Bachelor of Technology / Science' : 'Higher Education Degree',
      },
    ],
    technicalSkills: matchedTech.length > 0 ? matchedTech : ['Problem Solving', 'Computer Science Fundamentals'],
    softSkills: matchedSoft.length > 0 ? matchedSoft : ['Team Collaboration', 'Communication'],
    toolsAndFrameworks: matchedTech.filter((s) => ['React', 'Node.js', 'Git', 'Docker', 'Firebase', 'AWS'].includes(s)),
    workExperience: [],
    internships: [],
    projects: [],
    certifications: [],
    achievements: [],
  };

  const skillBreakdown: SkillCategoryBreakdown = {
    matched: matchedCompetencies,
    needsImprovement: [],
    missing: missingCompetencies,
    requiresVerification: ['Production Architecture', 'Large-scale Distributed Systems'],
  };

  return {
    extractedData,
    skillBreakdown,
    improvements,
    readinessScore: readiness.score,
  };
}

/**
 * Save resume analysis record to Firestore
 */
export async function saveResumeAnalysis(
  userId: string,
  analysis: Omit<ResumeAnalysisRecord, 'id'>
): Promise<string> {
  const analysisColRef = collection(db, 'users', userId, 'resume_analyses');
  const newDocRef = doc(analysisColRef);
  const record: ResumeAnalysisRecord = {
    ...analysis,
    id: newDocRef.id,
    userId,
    createdAt: new Date().toISOString(),
  };

  try {
    const savePromise = setDoc(newDocRef, record);
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore saveResumeAnalysis timeout')), 4000)
    );
    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Firestore saveResumeAnalysis background queue or error:', err);
  }
  return newDocRef.id;
}

/**
 * Get latest resume analysis for a user with offline resilience
 */
export async function getLatestResumeAnalysis(
  userId: string
): Promise<ResumeAnalysisRecord | null> {
  if (!userId) return null;
  try {
    const analysisColRef = collection(db, 'users', userId, 'resume_analyses');
    const q = query(analysisColRef, orderBy('createdAt', 'desc'), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      return null;
    }
    return snap.docs[0].data() as ResumeAnalysisRecord;
  } catch (err) {
    console.warn('Error fetching latest resume analysis (safe fallback to null):', err);
    return null;
  }
}

/**
 * List all resume analyses for user with offline resilience
 */
export async function getUserResumeAnalyses(
  userId: string
): Promise<ResumeAnalysisRecord[]> {
  if (!userId) return [];
  try {
    const analysisColRef = collection(db, 'users', userId, 'resume_analyses');
    const q = query(analysisColRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => docSnap.data() as ResumeAnalysisRecord);
  } catch (err) {
    console.warn('Error fetching resume analyses (safe fallback to empty list):', err);
    return [];
  }
}

/**
 * Update an existing resume analysis (e.g. after user review / corrections)
 */
export async function updateResumeAnalysis(
  userId: string,
  analysisId: string,
  updates: Partial<ResumeAnalysisRecord>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'resume_analyses', analysisId);
  await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
}

/**
 * Delete a resume analysis record and optionally its Storage file
 */
export async function deleteResumeAnalysis(
  userId: string,
  analysisId: string,
  storagePath?: string
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'resume_analyses', analysisId);
  await deleteDoc(docRef);

  if (storagePath) {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn('Storage file deletion non-fatal warning:', e);
    }
  }
}
