import { ConfidenceScore } from '../models/ConfidenceScore.js';
import { User } from '../models/User.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { RoadmapMilestone } from '../models/RoadmapMilestone.js';
import { Roadmap } from '../models/Roadmap.js';
import { ChatMessage } from '../models/ChatMessage.js';
import mongoose from 'mongoose';

/**
 * Evaluates technical skills score (0-100) based on user's registered skills
 * and depth of modern stack coverage.
 */
function evaluateTechnicalSkills(skills = [], targetRole = '') {
  if (!Array.isArray(skills) || skills.length === 0) {
    return 35; // Baseline starting score
  }

  // Base score proportional to breadth (up to 10 distinct skills)
  const countScore = Math.min(skills.length * 7.5, 60);

  // Industry-standard stack depth evaluation
  const modernKeywords = [
    'react', 'node', 'typescript', 'javascript', 'python', 'mongodb',
    'sql', 'docker', 'aws', 'flutter', 'dart', 'express', 'git',
    'rest', 'graphql', 'html', 'css', 'tailwind', 'next.js', 'ci/cd'
  ];

  const matchedKeywords = skills.filter((s) =>
    modernKeywords.some((k) => s.toLowerCase().includes(k))
  );

  const depthBonus = Math.min(matchedKeywords.length * 5, 40);
  return Math.min(Math.round(countScore + depthBonus), 100);
}

/**
 * Evaluates education & experience score (0-100)
 */
function evaluateEducationExperience(education, experienceLevel = 'Entry Level') {
  let score = 50; // base

  // Experience level weighting
  const expLower = (experienceLevel || '').toLowerCase();
  if (expLower.includes('senior') || expLower.includes('lead')) {
    score += 35;
  } else if (expLower.includes('mid')) {
    score += 25;
  } else {
    score += 15; // Entry level / Fresher
  }

  // Education evaluation
  if (education) {
    const degreeStr = (typeof education === 'string'
      ? education
      : `${education.degree || ''} ${education.college || ''} ${education.university || ''}`
    ).toLowerCase();

    if (degreeStr.includes('mca') || degreeStr.includes('master') || degreeStr.includes('m.s') || degreeStr.includes('m.tech')) {
      score += 15;
    } else if (degreeStr.includes('bachelor') || degreeStr.includes('b.s') || degreeStr.includes('b.tech') || degreeStr.includes('be')) {
      score += 10;
    } else if (degreeStr.length > 2) {
      score += 5;
    }
  }

  return Math.min(Math.max(score, 20), 100);
}

/**
 * Centralized Confidence Score Calculation and MongoDB Persistence
 */
export async function calculateAndSaveConfidenceScore(firebaseUid, explicitOverrides = {}) {
  if (!firebaseUid) {
    throw new Error('firebaseUid is required for confidence score calculation');
  }

  // 1. Fetch User Profile
  const user = await User.findOne({
    $or: [{ firebaseUid }, { uid: firebaseUid }],
  }).lean();

  const userSkills = user?.skills || user?.technicalSkills || [];
  const targetRole = user?.preferredJobRole || user?.targetRole || 'Full Stack Developer';
  const experienceLevel = user?.experienceLevel || user?.experience || 'Entry Level';
  const education = user?.education || '';

  // 2. Fetch Latest Resume Analysis (check ResumeAnalysis model first, then resumes collection)
  let latestResume = await ResumeAnalysis.findOne({
    $or: [{ userId: firebaseUid }, { firebaseUid }],
  }).sort({ createdAt: -1 }).lean();

  if (!latestResume && mongoose.connection.db) {
    try {
      latestResume = await mongoose.connection.db
        .collection('resumes')
        .findOne({ $or: [{ firebaseUid }, { userId: firebaseUid }] }, { sort: { createdAt: -1 } });
    } catch (e) {
      // ignore
    }
  }

  let resumeScore = 40; // baseline if no resume
  if (latestResume) {
    if (typeof latestResume.readinessScore === 'number') {
      resumeScore = latestResume.readinessScore;
    } else if (typeof latestResume.analysisScore === 'number') {
      resumeScore = latestResume.analysisScore;
    } else if (latestResume.analysis?.atsCompatibilityScore) {
      resumeScore = latestResume.analysis.atsCompatibilityScore;
    } else {
      resumeScore = 65;
    }
  }

  // 3. Fetch Roadmap Progress
  let roadmapProgressScore = 30; // baseline if no roadmap
  const milestones = await RoadmapMilestone.find({
    $or: [{ userId: firebaseUid }, { firebaseUid }],
  }).lean();

  if (milestones && milestones.length > 0) {
    const completed = milestones.filter((m) => m.completed).length;
    roadmapProgressScore = Math.min(
      Math.round(30 + (completed / milestones.length) * 70),
      100
    );
  } else {
    // Check Roadmaps collection
    const roadmapDoc = await Roadmap.findOne({
      $or: [{ userId: firebaseUid }, { firebaseUid }],
    }).sort({ createdAt: -1 }).lean();

    if (roadmapDoc) {
      const pct = roadmapDoc.progressPercent ?? roadmapDoc.completionPercentage ?? 0;
      roadmapProgressScore = Math.min(Math.round(35 + pct * 0.65), 100);
    }
  }

  // 4. Fetch Mock Interview & Engagement Score
  let mockInterviewScore = 55; // baseline calibration
  const chatCount = await ChatMessage.countDocuments({
    $or: [{ userId: firebaseUid }, { firebaseUid }],
  });

  if (chatCount > 0) {
    mockInterviewScore = Math.min(55 + Math.round(chatCount * 3), 95);
  }

  // 5. Evaluate Technical Skills & Education/Experience
  const technicalSkillsScore = evaluateTechnicalSkills(userSkills, targetRole);
  const educationExperienceScore = evaluateEducationExperience(education, experienceLevel);

  // Apply explicit overrides if provided (e.g. from PUT /api/confidence-score/update)
  const finalTechScore = explicitOverrides.technicalSkillsScore ?? technicalSkillsScore;
  const finalResumeScore = explicitOverrides.resumeScore ?? resumeScore;
  const finalMockScore = explicitOverrides.mockInterviewScore ?? mockInterviewScore;
  const finalRoadmapScore = explicitOverrides.roadmapProgressScore ?? roadmapProgressScore;
  const finalEduExpScore = explicitOverrides.educationExperienceScore ?? educationExperienceScore;

  // 6. Centralized Weighted Scoring Formula
  // Technical Skills (25%) + Resume (25%) + Mock Interview (15%) + Roadmap Progress (20%) + Education/Experience (15%)
  const overallConfidenceScore = Math.round(
    finalTechScore * 0.25 +
    finalResumeScore * 0.25 +
    finalMockScore * 0.15 +
    finalRoadmapScore * 0.20 +
    finalEduExpScore * 0.15
  );

  // 7. Dynamic Strengths, Weaknesses, and Recommendations
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  // Technical skills insights
  if (finalTechScore >= 75) {
    strengths.push(`Robust technical arsenal (${userSkills.slice(0, 4).join(', ')}) aligned with ${targetRole}`);
  } else {
    weaknesses.push(`Technical toolkit has missing competencies required for competitive ${targetRole} positions`);
    recommendations.push(`Expand hands-on proficiency in high-demand technologies for ${targetRole}`);
  }

  // Resume insights
  if (finalResumeScore >= 70) {
    strengths.push(`Resume ATS compatibility is strong (${finalResumeScore}%) with clear section structure`);
  } else {
    weaknesses.push(`Resume ATS index (${finalResumeScore}%) requires optimization with quantifiable project metrics`);
    recommendations.push(`Revise resume bullet points with measurable impact and action-oriented verbs`);
  }

  // Roadmap insights
  if (finalRoadmapScore >= 65) {
    strengths.push(`Consistent milestone velocity through the structured career roadmap`);
  } else {
    weaknesses.push(`Roadmap milestone completion (${finalRoadmapScore}%) is currently below benchmark`);
    recommendations.push(`Dedicate 3-5 hours weekly to execute the next active milestones on your career roadmap`);
  }

  // Mock interview insights
  if (finalMockScore >= 75) {
    strengths.push(`Active technical communication and interview practice demonstrated`);
  } else {
    recommendations.push(`Complete simulated mock technical interviews to sharpen problem-solving articulation`);
  }

  // Education / Experience insights
  if (finalEduExpScore >= 80) {
    strengths.push(`Academic credentials and industry experience provide strong positioning`);
  }

  // 8. Fetch existing score record to compute previousScore and scoreChange
  const existingScore = await ConfidenceScore.findOne({
    firebaseUid,
    isLatest: true,
  });

  const previousScore = existingScore ? existingScore.overallConfidenceScore : overallConfidenceScore;
  const scoreChange = overallConfidenceScore - previousScore;

  const now = new Date();
  const historyEntry = {
    overallConfidenceScore,
    technicalSkillsScore: finalTechScore,
    resumeScore: finalResumeScore,
    mockInterviewScore: finalMockScore,
    roadmapProgressScore: finalRoadmapScore,
    educationExperienceScore: finalEduExpScore,
    scoreChange,
    calculatedAt: now,
  };

  let savedRecord;

  if (existingScore) {
    // Append to history array and update latest record
    existingScore.history = existingScore.history || [];
    existingScore.history.push(historyEntry);

    // Keep history capped to last 50 snapshots
    if (existingScore.history.length > 50) {
      existingScore.history = existingScore.history.slice(-50);
    }

    existingScore.userId = firebaseUid;
    existingScore.previousScore = previousScore;
    existingScore.scoreChange = scoreChange;
    existingScore.overallConfidenceScore = overallConfidenceScore;
    existingScore.technicalSkillsScore = finalTechScore;
    existingScore.resumeScore = finalResumeScore;
    existingScore.mockInterviewScore = finalMockScore;
    existingScore.roadmapProgressScore = finalRoadmapScore;
    existingScore.educationExperienceScore = finalEduExpScore;
    existingScore.strengths = strengths;
    existingScore.weaknesses = weaknesses;
    existingScore.recommendations = recommendations;
    existingScore.calculationMethod = 'weighted_multimodal_v1';
    existingScore.lastCalculatedAt = now;
    existingScore.isLatest = true;

    savedRecord = await existingScore.save();
    console.log(`[ConfidenceScore] Updated score for ${firebaseUid}: ${overallConfidenceScore}% (Change: ${scoreChange >= 0 ? '+' : ''}${scoreChange})`);
  } else {
    // Create first persistent score document
    savedRecord = await ConfidenceScore.create({
      firebaseUid,
      userId: firebaseUid,
      overallConfidenceScore,
      technicalSkillsScore: finalTechScore,
      resumeScore: finalResumeScore,
      mockInterviewScore: finalMockScore,
      roadmapProgressScore: finalRoadmapScore,
      educationExperienceScore: finalEduExpScore,
      strengths,
      weaknesses,
      recommendations,
      previousScore: overallConfidenceScore,
      scoreChange: 0,
      calculationMethod: 'weighted_multimodal_v1',
      lastCalculatedAt: now,
      isLatest: true,
      history: [historyEntry],
    });
    console.log(`[ConfidenceScore] Created initial score for ${firebaseUid}: ${overallConfidenceScore}%`);
  }

  return savedRecord;
}

/**
 * Retrieves the latest score record or auto-calculates if missing
 */
export async function getLatestConfidenceScore(firebaseUid) {
  let score = await ConfidenceScore.findOne({
    firebaseUid,
    isLatest: true,
  });

  if (!score) {
    // Auto-calculate on demand
    score = await calculateAndSaveConfidenceScore(firebaseUid);
  }

  return score;
}

/**
 * Retrieves score history snapshots
 */
export async function getConfidenceScoreHistory(firebaseUid) {
  const current = await ConfidenceScore.findOne({
    firebaseUid,
    isLatest: true,
  });

  if (!current) {
    const calculated = await calculateAndSaveConfidenceScore(firebaseUid);
    return calculated.history || [];
  }

  return current.history || [];
}
