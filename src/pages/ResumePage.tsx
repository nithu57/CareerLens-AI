import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Edit2,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  validateResumeFile,
  uploadResumeToStorage,
  extractTextFromPdf,
  parseResumeTextHeuristic,
  saveResumeAnalysis,
  getLatestResumeAnalysis,
  deleteResumeAnalysis,
  updateResumeAnalysis,
} from '@/services/resumeService';
import { ResumeAnalysisRecord, RoleType, ExtractedResumeData } from '@/types';

const ROLES: RoleType[] = [
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

export const ResumePage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedRole, setSelectedRole] = useState<RoleType>(
    userProfile?.targetRole || 'Full-Stack Developer'
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string>('');
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  useEffect(() => {
    if (!currentUser) return;
    loadLatest();
  }, [currentUser]);

  const loadLatest = async () => {
    if (!currentUser) return;
    try {
      const record = await getLatestResumeAnalysis(currentUser.uid);
      setAnalysis(record);
      if (record) {
        setSelectedRole(record.targetRole);
        setEditedSkills(record.extractedData.technicalSkills.join(', '));
      }
    } catch (err) {
      console.error('Error fetching resume analysis:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validation = validateResumeFile(selected);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file format.');
      setFile(null);
      return;
    }

    setErrorMsg(null);
    setFile(selected);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !currentUser) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setUploadProgress(null);

    try {
      // 1. Extract text from PDF using PDF.js locally in the browser (fast and resilient)
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText || extractedText.length < 20) {
        throw new Error(
          'Could not extract text from this document. If this is a scanned image, please paste resume text or upload a text-based PDF.'
        );
      }

      // 2. Attempt Cloud Storage upload with progress tracking (optional cloud backup)
      let fileUrl = '';
      try {
        setUploadProgress(15);
        const storageResult = await uploadResumeToStorage(
          currentUser.uid,
          file,
          (percent) => setUploadProgress(percent)
        );
        fileUrl = storageResult.fileUrl;
      } catch (storageErr: any) {
        console.warn('Storage upload note:', storageErr.message);
        // Continue with analysis even if Cloud Storage bucket is unprovisioned in Firebase Console
      } finally {
        setUploadProgress(null);
      }

      // 3. Analyze extracted text against selected target role
      // Check if backend Cloud Function is reachable or execute explainable heuristic engine
      let parsedResult;
      const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || '';
      if (backendBaseUrl) {
        try {
          const resp = await fetch(`${backendBaseUrl}/api/resume/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: extractedText, targetRole: selectedRole }),
          });
          if (resp.ok) {
            parsedResult = await resp.json();
          }
        } catch (e) {
          console.warn('Backend Cloud Function unreachable, using local parser:', e);
        }
      }

      if (!parsedResult) {
        parsedResult = parseResumeTextHeuristic(extractedText, selectedRole);
      }

      // 4. Save to Firestore
      const recordToSave = {
        userId: currentUser.uid,
        fileName: file.name,
        fileUrl,
        extractedText: extractedText.slice(0, 50000),
        targetRole: selectedRole,
        readinessScore: parsedResult.readinessScore || 70,
        extractedData: parsedResult.extractedData,
        skillBreakdown: parsedResult.skillBreakdown,
        improvements: parsedResult.improvements || [],
        isUserVerified: true,
        createdAt: new Date().toISOString(),
      };

      const docId = await saveResumeAnalysis(currentUser.uid, recordToSave);
      setAnalysis({ ...recordToSave, id: docId });
      setEditedSkills(recordToSave.extractedData.technicalSkills.join(', '));
      setFile(null);
      setUploadProgress(null);
    } catch (err: any) {
      console.error('Resume processing error:', err);
      setErrorMsg(err.message || 'Failed to analyze resume document.');
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteResume = async () => {
    if (!analysis || !currentUser) return;
    if (!window.confirm('Are you sure you want to delete this resume analysis?')) return;

    try {
      await deleteResumeAnalysis(currentUser.uid, analysis.id);
      setAnalysis(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSaveEdits = async () => {
    if (!analysis || !currentUser) return;
    const skillsArray = editedSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedData: ExtractedResumeData = {
      ...analysis.extractedData,
      technicalSkills: skillsArray,
    };

    try {
      await updateResumeAnalysis(currentUser.uid, analysis.id, {
        extractedData: updatedData,
      });
      setAnalysis({ ...analysis, extractedData: updatedData });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving edits:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Role Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-brand-600" />
            <span>Resume Upload & Competency Extraction</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload your PDF resume to extract verified skills, projects, and calculate your role readiness score.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs font-semibold text-slate-700">Target Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as RoleType)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-brand-700 bg-white shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Resume Processing Alert</h4>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-10 text-center hover:border-brand-500 transition-colors shadow-subtle">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-navy-950">
              {file ? file.name : 'Upload your PDF Resume'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard PDF documents up to 10MB. Text is securely extracted and verified against strict schemas.
            </p>
          </div>

          {uploadProgress !== null && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Uploading to Cloud Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-2 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Choose File
            </button>

            {file && (
              <button
                type="button"
                onClick={handleUploadAndAnalyze}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Competencies...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-navy-950">{analysis.fileName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                  Verified Analysis
                </span>
                {analysis.fileUrl && (
                  <a
                    href={analysis.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 underline flex items-center space-x-1 ml-2"
                  >
                    <span>View Stored PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Analyzed for <span className="font-semibold text-slate-800">{analysis.targetRole}</span> on{' '}
                {new Date(analysis.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right pr-3 border-r border-slate-200">
                <span className="text-xs text-slate-400 font-medium block">Readiness Score</span>
                <span className="text-2xl font-extrabold text-brand-600">
                  {analysis.readinessScore}%
                </span>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit extracted skills"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeleteResume}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete resume analysis"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Structured Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Technical & Soft Skills */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Technical Skills</span>
                </h3>
                {isEditing ? (
                  <button
                    onClick={handleSaveEdits}
                    className="text-xs text-emerald-600 font-bold flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-500 font-medium">
                    Comma-separated skills:
                  </label>
                  <textarea
                    rows={4}
                    value={editedSkills}
                    onChange={(e) => setEditedSkills(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.extractedData.technicalSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Tools & Frameworks</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.extractedData.toolsAndFrameworks.length > 0 ? (
                    analysis.extractedData.toolsAndFrameworks.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None extracted.</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Soft Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.extractedData.softSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Competency Breakdown for Target Role */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Target Role Match: {analysis.targetRole}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Alignment against core competency benchmarks
                </p>
              </div>

              {/* Matched */}
              <div>
                <h4 className="text-xs font-bold text-emerald-700 flex items-center space-x-1.5 mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Matched Competencies ({analysis.skillBreakdown.matched.length})</span>
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.skillBreakdown.matched.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-amber-700 flex items-center space-x-1.5 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Missing from Evidence ({analysis.skillBreakdown.missing.length})</span>
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.skillBreakdown.missing.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requires Verification */}
              {analysis.skillBreakdown.requiresVerification.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-600 mb-1.5">
                    Requires Verification
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.skillBreakdown.requiresVerification.map((v, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Recommendations & Education */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Resume Recommendations</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {analysis.improvements.map((imp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed"
                  >
                    {imp}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Education</span>
                </h4>
                {analysis.extractedData.education.map((edu, idx) => (
                  <div key={idx} className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{edu.degree}</p>
                    <p className="text-[11px] text-slate-500">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
