import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Save,
  CheckCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Clock,
  Target,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { RoleType, ExperienceLevel, WorkArrangement } from '@/types';

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

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Student / Fresher',
  'Entry Level (0-2 yrs)',
  'Mid Level (3-5 yrs)',
  'Senior (5+ yrs)',
];

const WORK_ARRANGEMENTS: WorkArrangement[] = ['Remote', 'Hybrid', 'On-site', 'Flexible'];

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name is required'),
  education: z.string().min(2, 'Education is required'),
  experienceLevel: z.string().min(1, 'Experience level required'),
  targetRole: z.string().min(1, 'Target role required'),
  preferredLocation: z.string().min(2, 'Location required'),
  workArrangement: z.string().min(1, 'Arrangement required'),
  weeklyHours: z.number().min(2).max(60),
  careerGoals: z.string().min(5, 'Career goals required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [skillsText, setSkillsText] = useState<string>(
    userProfile?.technicalSkills?.join(', ') || 'React, TypeScript, Node.js'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userProfile?.displayName || currentUser?.displayName || '',
      education: userProfile?.education || 'B.Tech / Degree',
      experienceLevel: userProfile?.experienceLevel || 'Student / Fresher',
      targetRole: userProfile?.targetRole || 'Full-Stack Developer',
      preferredLocation: userProfile?.preferredLocation || 'Bengaluru / Remote',
      workArrangement: userProfile?.workArrangement || 'Hybrid',
      weeklyHours: userProfile?.weeklyHours || 12,
      careerGoals: userProfile?.careerGoals || 'Build production software and advance in senior architecture.',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setSavedSuccess(false);

    const skillsArray = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateUserProfile(currentUser.uid, {
        displayName: data.displayName,
        education: data.education,
        experienceLevel: data.experienceLevel as ExperienceLevel,
        targetRole: data.targetRole as RoleType,
        preferredLocation: data.preferredLocation,
        workArrangement: data.workArrangement as WorkArrangement,
        weeklyHours: data.weeklyHours,
        careerGoals: data.careerGoals,
        technicalSkills: skillsArray,
      });

      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
          <User className="w-6 h-6 text-brand-600" />
          <span>Profile & Career Preferences</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Update your background, target career role, and weekly availability. Changes automatically calibrate your skill-gap evaluations.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated and synchronized with Cloud Firestore successfully.</span>
        </div>
      )}

      {/* Main Profile Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                {...register('displayName')}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
              />
              {errors.displayName && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Highest Education / University
              </label>
              <input
                type="text"
                {...register('education')}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
              />
              {errors.education && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.education.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Experience Tier
              </label>
              <select
                {...register('experienceLevel')}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-brand-500"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Target Technology Role
              </label>
              <select
                {...register('targetRole')}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold text-brand-700 focus:ring-1 focus:ring-brand-500"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Preferred Work Location
              </label>
              <input
                type="text"
                {...register('preferredLocation')}
                placeholder="e.g. Bengaluru, Hyderabad, Remote"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Work Arrangement Preference
              </label>
              <select
                {...register('workArrangement')}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-brand-500"
              >
                {WORK_ARRANGEMENTS.map((wa) => (
                  <option key={wa} value={wa}>
                    {wa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-700">
                  Weekly Study Hours
                </label>
                <span className="text-xs font-bold text-brand-600">
                  {watch('weeklyHours')} hrs / week
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                step="2"
                {...register('weeklyHours', { valueAsNumber: true })}
                className="mt-2 w-full accent-brand-600 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Verified Technical Skills (Comma-separated)
            </label>
            <textarea
              rows={3}
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="mt-1 block w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Skills confirmed by you or extracted from your uploaded resume.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Career Ambitions & Objectives
            </label>
            <textarea
              rows={3}
              {...register('careerGoals')}
              className="mt-1 block w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
