# CareerLens AI — Intelligent Career & Skill Gap Analyzer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-10.14-orange)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac)
![Vitest](https://img.shields.io/badge/Vitest-2.1-green)

**CareerLens AI** is a production-oriented, full-stack web application designed for students, fresh graduates, and tech professionals to analyze resumes against modern industry benchmarks, uncover critical skill gaps, discover live jobs, and follow dynamic, personalized 4-to-8 week learning roadmaps.

---

## 🌟 Key Features

1. **Intelligent PDF Resume Parsing & Extraction:**
   - Client-side PDF text extraction via PDF.js worker.
   - Secure PDF upload to Firebase Cloud Storage with strict 10MB limit and MIME validation (`application/pdf`).
   - Deep structured resume analysis powered by Gemini API, identifying technical skills, soft skills, work experience, projects, certifications, and high-impact resume improvements.

2. **Explainable Readiness Scoring Engine:**
   - Standardized competency benchmarks for 11 core technology roles:
     - *Full-Stack Developer, Frontend Developer, Backend Developer, Flutter Developer, Software Engineer, Data Analyst, Data Scientist, AI Engineer, Cloud Engineer, Cybersecurity Analyst, DevOps Engineer*.
   - Mathematical formula:
     $$\text{Readiness Score} = \left(\frac{\text{Weighted Matched Competencies}}{\text{Total Required Competency Weight}}\right) \times 100$$
   - Clear distinction between verified competencies, in-progress skills (50% partial credit), and missing skills.
   - Prominently labeled as an **advisory career guidance metric**, not a legal guarantee of employment.

3. **Live Job Market Discovery & Comparison:**
   - Real-time job search integrated with the **Adzuna API** across Indian hubs (*Bengaluru, Hyderabad, Chennai, Pune, Mumbai*) and Remote roles.
   - Built-in **Verified Market Benchmarks** fallback with transparent provider labels and direct links to official company career portals (*Infosys, Microsoft, Persistent, TCS, Jio, Swiggy*).
   - Side-by-side resume vs. job requirement skill matcher.
   - Real-time save/unsave functionality synced directly to Firestore subcollections.

4. **Dynamic 4-to-8 Week Personalized Learning Roadmaps:**
   - Tailored to the user's target role, identified skill gaps, and weekly study availability (5–40 hours/week).
   - Each milestone includes:
     - Clear weekly objectives and prioritized action items.
     - Practical, real-world hands-on exercises.
     - Complete portfolio project specifications with deliverables and tech stacks.
     - Verified official documentation resources (React docs, MDN, Python docs, Docker, Kubernetes, etc.).
   - Interactive milestone completion checkoffs with real-time Firestore persistence and progress bars.

5. **LensBot — Context-Aware AI Career Mentor:**
   - Interactive career coach with direct awareness of the user's target role, readiness score, and missing competencies.
   - Features structured interview prep, resume phrasing improvements, learning roadmap guidance, and salary negotiation tactics.
   - Returns verifiable citations and suggested follow-up prompts.
   - Chat history safely isolated in `users/{userId}/chat_history`.

6. **Market & Salary Intelligence:**
   - Real-time skill demand analytics by role and location using Recharts visualizations.
   - Salary distribution bands across Junior, Mid-Level, Senior, and Lead tiers in INR (₹).
   - Sample size indicators, observation periods, and timestamp of last data refresh.

7. **Comprehensive Security & Privacy Compliance:**
   - Multi-layered Firestore security rules authored using the modular validator pattern.
   - Complete tenant isolation: users can only access their own profile, resumes, analyses, saved jobs, roadmaps, and chat history.
   - Full GDPR/CCPA data export (JSON download) and atomic cascade account deletion.

---

## 🏗 Architecture Overview

```
MERN_WEBSITE/
├── src/
│   ├── components/
│   │   ├── common/         # ProtectedRoute, UI primitives
│   │   └── layout/         # Navbar, Footer, DashboardLayout, PublicLayout
│   ├── contexts/           # AuthContext (Firebase Auth lifecycle & profile sync)
│   ├── lib/                # firebase.ts (Firebase SDK init & configuration diagnostics)
│   ├── pages/              # 22+ Production route screens (Landing, Dashboard, Resume, Jobs, etc.)
│   ├── services/           # userService, resumeService, jobsService, roadmapService, lensBotService, marketService
│   ├── test/               # Vitest suite (readiness score, resume parser, jobs, roadmap, components)
│   ├── types/              # TypeScript interfaces (UserProfile, ResumeAnalysis, JobListing, etc.)
│   ├── App.tsx             # Root router configuration
│   └── main.tsx            # Application entrypoint
├── functions/              # Firebase Cloud Functions (v2 TypeScript)
│   ├── src/
│   │   ├── index.ts        # Cloud Functions entrypoint & Secret Manager configuration
│   │   ├── apiRouter.ts    # Secure Express router (/api/resume, /api/jobs, /api/lensbot, /api/market)
│   │   ├── geminiService.ts# Gemini 1.5 Flash structured parser & career assistant
│   │   ├── adzunaService.ts# Adzuna job search API adapter
│   │   ├── youtubeService.ts # YouTube Data API adapter for verified tutorials
│   │   └── marketAggregator.ts # Scheduled function for weekly market trends snapshot
│   ├── package.json
│   └── tsconfig.json
├── firebase.json           # Firebase Hosting, Functions, Firestore, and Storage deployment spec
├── firestore.rules         # 430+ lines of hardened CEL security rules
├── firestore.indexes.json  # Composite query indexes
├── storage.rules           # Cloud Storage security rules (10MB limit & PDF MIME checking)
├── .firebaserc             # Firebase project configuration (careerLens-ai-8beae)
├── .env.example            # Environment variables template
└── vite.config.ts          # Vite & Vitest configuration
```

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Node.js**: v18.x or v20.x (Recommended: v20.18+)
- **npm**: v9.x or v10.x
- **Firebase CLI**: `npm install -g firebase-tools` (or use `npx firebase-tools`)

### 1. Clone & Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your client Firebase credentials from your [Firebase Console](https://console.firebase.google.com/project/careerLens-ai-8beae/settings/general):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=careerLens-ai-8beae.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=careerLens-ai-8beae
VITE_FIREBASE_STORAGE_BUCKET=careerLens-ai-8beae.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-...

# Optional Cloud Functions backend endpoint (if deploying functions)
VITE_BACKEND_API_URL=https://api-us-central1-careerlens-ai-8beae.cloudfunctions.net
```

---

## 🔒 Firebase Console Setup Checklist

Before launching, complete these 3 setup steps in your Firebase Console:

### Step 1: Enable Firebase Authentication Providers
1. Go to [Firebase Console > Authentication > Sign-in method](https://console.firebase.google.com/project/careerLens-ai-8beae/authentication/providers).
2. Click **Email/Password** and toggle **Enable** (leave Email link disabled). Click **Save**.
3. Click **Add new provider**, select **Google**, toggle **Enable**, set the support email, and click **Save**.
4. In **Authorized domains**, ensure `localhost` and `careerlens-ai-8beae.web.app` are listed.

### Step 2: Provision Cloud Firestore
1. Go to [Firebase Console > Firestore Database](https://console.firebase.google.com/project/careerLens-ai-8beae/firestore).
2. Click **Create database**.
3. Choose location (e.g., `asia-south1` for India or `us-central1`).
4. Select **Start in production mode**. (Our local `firestore.rules` will be deployed).

### Step 3: Provision Cloud Storage
1. Go to [Firebase Console > Storage](https://console.firebase.google.com/project/careerLens-ai-8beae/storage).
2. Click **Get Started**.
3. Choose production mode and select the default bucket (`careerlens-ai-8beae.appspot.com`).

---

## 🔑 Firebase Cloud Functions & Secret Manager Setup

The backend Cloud Functions use Google Cloud Secret Manager so API keys are never exposed in client bundles or git repositories.

Run the following commands in your terminal to set your API keys:

```bash
# 1. Google Gemini API Key (Required for AI Resume Analysis & LensBot)
npx firebase-tools functions:secrets:set GEMINI_API_KEY

# 2. Adzuna Job Search API (Required for live international & Indian job queries)
npx firebase-tools functions:secrets:set ADZUNA_APP_ID
npx firebase-tools functions:secrets:set ADZUNA_APP_KEY

# 3. YouTube Data API Key (Optional for live learning video search)
npx firebase-tools functions:secrets:set YOUTUBE_API_KEY
```

> **Note on Graceful Degradation:**
> If any API key is not yet configured, the system gracefully falls back to:
> - Client-side heuristic resume parsing and explainable competency weights.
> - High-quality **Verified Market Benchmarks** with direct links to top company career portals.
> - Curated official documentation catalog for all 11 technical roles.

---

## 💻 Local Development & Testing

```bash
# Start frontend development server on http://localhost:3000
npm run dev

# Run full Vitest automated test suite (21 unit & component tests)
npm run test

# Run TypeScript check and production build
npm run build

# Compile Cloud Functions TypeScript
cd functions && npm run build && cd ..
```

---

## 🚢 Deployment to Firebase

Once logged in with `npx firebase-tools login`, deploy all resources with a single command:

```bash
# Build the production frontend
npm run build

# Deploy Hosting, Firestore Rules, Firestore Indexes, Storage Rules, and Cloud Functions
npx firebase-tools deploy
```

Or deploy components selectively:

```bash
# Deploy web app hosting only
npx firebase-tools deploy --only hosting

# Deploy security rules and indexes only
npx firebase-tools deploy --only firestore,storage

# Deploy Cloud Functions only
npx firebase-tools deploy --only functions
```

Your live web application will be accessible at:
- `https://careerlens-ai-8beae.web.app`
- `https://careerlens-ai-8beae.firebaseapp.com`

---

## 🛡 Security Architecture Summary

- **Firestore Rules (`firestore.rules`):**
  - Modular helper functions (`isSignedIn()`, `isOwner(userId)`, `hasOnlyAllowedFields(...)`).
  - Strict field-level schema validation for profiles, resumes, saved jobs, roadmap items, and chat messages.
  - Deny-by-default top-level collections preventing unauthorized enumerations.
- **Cloud Storage Rules (`storage.rules`):**
  - Isolates files to `/resumes/{userId}/{fileName}` where only `request.auth.uid == userId` can read or write.
  - Enforces `request.resource.size <= 10 * 1024 * 1024` (10MB limit).
  - Enforces `request.resource.contentType == 'application/pdf'`.
- **Account Cascade Deletion:**
  - When a user deletes their account from `/settings`, all Firestore documents, subcollections, and Storage PDF files are deleted atomically before deleting the Firebase Auth user record.

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
