import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'AIzaSyExampleKey-YourApiKeyHere' || apiKey.includes('placeholder')) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface GeminiResumeAnalysisOutput {
  extractedData: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    education: { institution: string; degree: string; fieldOfStudy?: string; graduationYear?: string }[];
    technicalSkills: string[];
    softSkills: string[];
    toolsAndFrameworks: string[];
    workExperience: { company: string; role: string; duration: string; description: string }[];
    internships: { company: string; role: string; duration: string; description: string }[];
    projects: { name: string; description: string; technologies: string[]; link?: string }[];
    certifications: { name: string; issuer: string; year?: string }[];
    achievements: string[];
  };
  skillBreakdown: {
    matched: string[];
    needsImprovement: string[];
    missing: string[];
    requiresVerification: string[];
  };
  improvements: string[];
  readinessScore: number;
}

export async function analyzeResumeWithGemini(
  resumeText: string,
  targetRole: string
): Promise<GeminiResumeAnalysisOutput> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error(
      'GEMINI_API_KEY is not configured in Firebase Secret Manager. Please set the secret or use client fallback analysis.'
    );
  }

  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const systemPrompt = `You are a strict, objective career intelligence analyst for CareerLens AI.
Analyze the following resume text specifically against the competencies required for the role of: "${targetRole}".
CRITICAL CONSTRAINTS:
1. Never invent or hallucinate any degree, job experience, project, or skill not mentioned or reasonably evidenced in the resume.
2. Distinguish user-confirmed proficiency from unmentioned skills. If a skill is unmentioned, mark it as "missing" or "requiresVerification".
3. Calculate an explainable readinessScore (0-100) representing competency alignment.
4. Output valid JSON strictly conforming to this schema:
{
  "extractedData": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "education": [{"institution": "string", "degree": "string", "fieldOfStudy": "string", "graduationYear": "string"}],
    "technicalSkills": ["string"],
    "softSkills": ["string"],
    "toolsAndFrameworks": ["string"],
    "workExperience": [{"company": "string", "role": "string", "duration": "string", "description": "string"}],
    "internships": [{"company": "string", "role": "string", "duration": "string", "description": "string"}],
    "projects": [{"name": "string", "description": "string", "technologies": ["string"], "link": "string"}],
    "certifications": [{"name": "string", "issuer": "string", "year": "string"}],
    "achievements": ["string"]
  },
  "skillBreakdown": {
    "matched": ["string"],
    "needsImprovement": ["string"],
    "missing": ["string"],
    "requiresVerification": ["string"]
  },
  "improvements": ["string"],
  "readinessScore": 75
}`;

  const prompt = `${systemPrompt}\n\nRESUME CONTENT:\n${resumeText.slice(0, 30000)}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const parsed = JSON.parse(text) as GeminiResumeAnalysisOutput;
    return parsed;
  } catch (err) {
    console.error('Failed to parse Gemini output JSON:', text);
    throw new Error('Malformed response from AI model');
  }
}

export async function analyzeJobDescriptionWithGemini(
  resumeText: string,
  jobDescription: string
): Promise<{ matchScore: number; matchedSkills: string[]; missingSkills: string[]; recommendations: string[] }> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured in Firebase Secret Manager.');
  }

  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const prompt = `Compare this candidate's verified resume text against the specific job description.
Return JSON:
{
  "matchScore": number (0-100),
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "recommendations": ["string"]
}
RESUME:
${resumeText.slice(0, 15000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 15000)}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function chatWithLensBotGemini(
  userPrompt: string,
  userContext: any
): Promise<{ content: string; citations?: any[]; suggestedFollowUps?: string[] }> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const contextStr = JSON.stringify({
    targetRole: userContext?.profile?.targetRole || 'Software Engineer',
    readinessScore: userContext?.latestResume?.readinessScore,
    matchedSkills: userContext?.latestResume?.skillBreakdown?.matched?.slice(0, 8),
    missingSkills: userContext?.latestResume?.skillBreakdown?.missing?.slice(0, 6),
    savedJobsCount: userContext?.savedJobs?.length || 0,
  });

  const systemInstruction = `You are LensBot, the expert AI career mentor for CareerLens AI.
You provide constructive, encouraging, highly technical, and practical career guidance.
Current User Context: ${contextStr}

Respond in markdown. Always offer actionable, verifiable next steps. At the end of your response, list 2 suggested follow-up prompts on a new line prefixed with "FOLLOWUP:".`;

  const result = await model.generateContent([
    { text: systemInstruction },
    { text: userPrompt },
  ]);

  const rawText = result.response.text();
  const followUps: string[] = [];
  const lines = rawText.split('\n');
  const cleanLines = lines.filter((line) => {
    if (line.startsWith('FOLLOWUP:')) {
      followUps.push(line.replace('FOLLOWUP:', '').trim());
      return false;
    }
    return true;
  });

  return {
    content: cleanLines.join('\n').trim(),
    suggestedFollowUps: followUps.length > 0 ? followUps : undefined,
  };
}
