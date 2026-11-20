import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Clock,
  Target,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { RoleType, ExperienceLevel, WorkArrangement, UserProfile } from '@/types';

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

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL',
  'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Google Cloud',
  'Firebase', 'Flutter', 'Dart', 'Tailwind CSS', 'Git', 'REST APIs',
  'GraphQL', 'Pandas', 'PyTorch', 'Linux', 'CI/CD'
];

const onboardingSchema = z.object({
  displayName: z.string().min(2, 'Name is required'),
  education: z.string().min(2, 'Please specify your education or degree'),
  experienceLevel: z.string().min(1, 'Please select your experience level'),
  targetRole: z.string().min(1, 'Please select your target role'),
  preferredLocation: z.string().min(2, 'Preferred location is required'),
  workArrangement: z.string().min(1, 'Please select a work arrangement'),
  weeklyHours: z.number().min(2).max(60),
  careerGoals: z.string().min(10, 'Please share a brief sentence about your career goals'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['JavaScript', 'React']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { currentUser, userProfile, refreshProfile, updateLocalProfile } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: userProfile?.displayName || currentUser?.displayName || '',
      education: userProfile?.education || 'B.Tech in Computer Science',
      experienceLevel: userProfile?.experienceLevel || 'Student / Fresher',
      targetRole: userProfile?.targetRole || 'Full-Stack Developer',
      preferredLocation: userProfile?.preferredLocation || 'Bengaluru / Remote',
      workArrangement: userProfile?.workArrangement || 'Hybrid',
      weeklyHours: userProfile?.weeklyHours || 12,
      careerGoals: userProfile?.careerGoals || 'Transition into a high-growth engineering role and bridge distributed systems skill gaps.',
    },
  });

  // If onboarding is already completed, skip directly to dashboard!
  React.useEffect(() => {
    const isCompleted =
      userProfile?.onboardingCompleted ||
      (typeof window !== 'undefined' &&
        currentUser &&
        window.localStorage?.getItem(`careerlens_onboarding_completed_${currentUser.uid}`) === 'true');

    if (isCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [userProfile, currentUser, navigate]);

  // Sync profile details if they arrive or update asynchronously
  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setValue('displayName', userProfile.displayName);
      if (userProfile.education) setValue('education', userProfile.education);
      if (userProfile.experienceLevel) setValue('experienceLevel', userProfile.experienceLevel);
      if (userProfile.targetRole) setValue('targetRole', userProfile.targetRole);
      if (userProfile.preferredLocation) setValue('preferredLocation', userProfile.preferredLocation);
      if (userProfile.workArrangement) setValue('workArrangement', userProfile.workArrangement);
      if (userProfile.weeklyHours) setValue('weeklyHours', userProfile.weeklyHours);
      if (userProfile.careerGoals) setValue('careerGoals', userProfile.careerGoals);
      if (userProfile.technicalSkills && userProfile.technicalSkills.length > 0) {
        setSelectedSkills(userProfile.technicalSkills);
      }
    }
  }, [userProfile, setValue]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      const trimmed = customSkillInput.trim();
      if (!selectedSkills.includes(trimmed)) {
        setSelectedSkills([...selectedSkills, trimmed]);
      }
      setCustomSkillInput('');
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const profileUpdates: Partial<UserProfile> = {
      uid: currentUser.uid,
      email: currentUser.email || userProfile?.email || '',
      displayName: data.displayName.trim(),
      education: data.education.trim(),
      experienceLevel: data.experienceLevel as ExperienceLevel,
      targetRole: data.targetRole as RoleType,
      preferredLocation: data.preferredLocation.trim(),
      workArrangement: data.workArrangement as WorkArrangement,
      weeklyHours: data.weeklyHours,
      careerGoals: data.careerGoals.trim(),
      technicalSkills: selectedSkills,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Immediately persist in localStorage so this step is NEVER shown again
      if (typeof window !== 'undefined' && currentUser.uid) {
        try {
          window.localStorage.setItem(`careerlens_onboarding_completed_${currentUser.uid}`, 'true');
          window.localStorage.setItem(`careerlens_profile_${currentUser.uid}`, JSON.stringify(profileUpdates));
        } catch (e) {}
      }

      // 2. Optimistically update local profile state in AuthContext
      updateLocalProfile({ ...profileUpdates, onboardingCompleted: true });

      // 3. Persist to Firestore (races with 5s timeout in userService to prevent infinite hangs)
      await updateUserProfile(currentUser.uid, { ...profileUpdates, onboardingCompleted: true });

      // 4. Navigate immediately to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Failed to save onboarding:', err);
      if (err?.code === 'permission-denied') {
        setSubmitError(
          'Permission denied by Firestore Security Rules. In Firebase Console > Firestore Database > Rules, please publish the updated security rules.'
        );
      } else if (err?.code === 'unavailable' || err?.message?.includes('offline') || err?.message?.includes('network')) {
        // If offline or network timeout, local cache already has the profile; let the user into dashboard!
        navigate('/dashboard', { replace: true });
        return;
      } else {
        setSubmitError(err?.message || 'Failed to save profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickComplete = async () => {
    if (!currentUser || isSubmitting) return;
    const currentValues = watch();
    await onSubmit({
      displayName: currentValues.displayName?.trim() || userProfile?.displayName || currentUser.displayName || 'Member',
      education: currentValues.education?.trim() || userProfile?.education || 'B.Tech in Computer Science',
      experienceLevel: currentValues.experienceLevel || userProfile?.experienceLevel || 'Student / Fresher',
      targetRole: currentValues.targetRole || userProfile?.targetRole || 'Full-Stack Developer',
      preferredLocation: currentValues.preferredLocation?.trim() || userProfile?.preferredLocation || 'Bengaluru / Remote',
      workArrangement: currentValues.workArrangement || userProfile?.workArrangement || 'Hybrid',
      weeklyHours: currentValues.weeklyHours || userProfile?.weeklyHours || 12,
      careerGoals: currentValues.careerGoals?.trim() || userProfile?.careerGoals || 'Transition into a high-growth engineering role and bridge distributed systems skill gaps.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Logo and Progress indicator */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 text-brand-600 font-bold text-sm">
            <Compass className="w-5 h-5" />
            <span>CareerLens AI Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Personalize Your Career Intelligence
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Step {step} of 3: Tailoring competencies, learning pace, and job recommendations.
          </p>

          <div className="flex items-center justify-center space-x-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  s === step ? 'w-8 bg-brand-600' : s < step ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
          {submitError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Unable to Save Profile</p>
                <p className="mt-0.5 text-rose-700">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Identity & Education */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-brand-600" />
                    <span>Background & Experience</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tell us about your educational foundation and experience tier.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    {...register('displayName')}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.displayName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Highest Education / Degree
                  </label>
                  <input
                    type="text"
                    {...register('education')}
                    placeholder="e.g. B.Tech Computer Science, B.Sc, Self-Taught"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                  {errors.education && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.education.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Experience Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map((level) => {
                      const isSelected = watch('experienceLevel') === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setValue('experienceLevel', level)}
                          className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleQuickComplete}
                    disabled={isSubmitting}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Save & Skip to Dashboard →
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Next: Target Career</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Target Role & Skills */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                    <Target className="w-4 h-4 text-brand-600" />
                    <span>Target Career & Skills</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your aspirational role and highlight tools you currently know.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Role
                  </label>
                  <select
                    {...register('targetRole')}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Technical Skills (Select all you have used)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {POPULAR_SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={addCustomSkill}
                    placeholder="Type custom skill and press Enter..."
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleQuickComplete}
                      disabled={isSubmitting}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Save & Skip to Dashboard →
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span>Next: Preferences & Goals</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location, Availability & Goals */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>Availability & Career Ambition</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize your roadmap pace and preferred work parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      {...register('preferredLocation')}
                      placeholder="e.g. Bengaluru, Hyderabad, Remote"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Work Arrangement
                    </label>
                    <select
                      {...register('workArrangement')}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                    >
                      {WORK_ARRANGEMENTS.map((wa) => (
                        <option key={wa} value={wa}>
                          {wa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Weekly Learning Availability
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
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    We will calibrate the difficulty and action items of your dynamic roadmap to match this weekly pace.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Primary Career Goal
                  </label>
                  <textarea
                    rows={3}
                    {...register('careerGoals')}
                    placeholder="e.g. Land a Senior Full-Stack role in Bengaluru within 4 months, mastering system design and cloud infrastructure."
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                  {errors.careerGoals && (
                    <p className="mt-1 text-[11px] text-rose-600">{errors.careerGoals.message}</p>
                  )}
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 flex items-center space-x-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Finish & Launch Dashboard</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
