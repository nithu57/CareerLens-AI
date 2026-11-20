import { User } from '../models/User.js';

/**
 * POST /api/auth/sync
 * Synchronizes authenticated Firebase user into MongoDB.
 * Called immediately after frontend Firebase login or registration.
 */
export const syncAuthUser = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid;
    const {
      name,
      fullName,
      displayName,
      email,
      profileImage,
      photoURL,
      phone,
      phoneNumber,
      education,
      university,
      college,
      degree,
      graduationYear,
      skills,
      technicalSkills,
      programmingLanguages,
      frontendSkills,
      backendSkills,
      databaseSkills,
      frameworks,
      toolsAndTechnologies,
      skillProficiencies,
      experience,
      experienceLevel,
      preferredJobRoles,
      preferredJobRole,
      targetRole,
      careerGoals,
      careerInterests,
      careerReadinessScore,
      onboardingCompleted,
      preferredLocation,
      workArrangement,
      weeklyHours,
    } = req.body;

    const userEmail = email || req.user.email;
    const userName = fullName || name || displayName || req.user.name || req.user.displayName;

    const updateFields = {
      firebaseUid,
      uid: firebaseUid,
      ...(userEmail && { email: userEmail.toLowerCase() }),
      ...(userName && { name: userName, displayName: userName, fullName: userName }),
      ...(profileImage && { profileImage, photoURL: profileImage }),
      ...(photoURL && { profileImage: photoURL, photoURL }),
      ...(phone && { phone, phoneNumber: phone }),
      ...(phoneNumber && { phone: phoneNumber, phoneNumber }),
      ...(university && { university, college: university }),
      ...(college && { college, university: college }),
      ...(degree && { degree }),
      ...(graduationYear && { graduationYear: Number(graduationYear) }),
      ...(education && { education }),
      ...(skills && Array.isArray(skills) && { skills }),
      ...(technicalSkills && Array.isArray(technicalSkills) && { technicalSkills, skills: technicalSkills }),
      ...(programmingLanguages && Array.isArray(programmingLanguages) && { programmingLanguages }),
      ...(frontendSkills && Array.isArray(frontendSkills) && { frontendSkills }),
      ...(backendSkills && Array.isArray(backendSkills) && { backendSkills }),
      ...(databaseSkills && Array.isArray(databaseSkills) && { databaseSkills }),
      ...(frameworks && Array.isArray(frameworks) && { frameworks }),
      ...(toolsAndTechnologies && Array.isArray(toolsAndTechnologies) && { toolsAndTechnologies }),
      ...(skillProficiencies && { skillProficiencies }),
      ...(experience && { experience, experienceLevel: experience }),
      ...(experienceLevel && { experience: experienceLevel, experienceLevel }),
      ...(preferredJobRoles && Array.isArray(preferredJobRoles) && { preferredJobRoles }),
      ...(preferredJobRole && { preferredJobRole, targetRole: preferredJobRole }),
      ...(targetRole && { targetRole, preferredJobRole: targetRole, preferredJobRoles: [targetRole] }),
      ...(careerGoals && { careerGoals }),
      ...(careerInterests && Array.isArray(careerInterests) && { careerInterests }),
      ...(careerReadinessScore !== undefined && { careerReadinessScore: Number(careerReadinessScore) }),
      ...(preferredLocation && { preferredLocation }),
      ...(workArrangement && { workArrangement }),
      ...(weeklyHours !== undefined && { weeklyHours: Number(weeklyHours) }),
      ...(typeof onboardingCompleted === 'boolean' && { onboardingCompleted }),
    };

    const user = await User.findOneAndUpdate(
      { $or: [{ firebaseUid }, { uid: firebaseUid }] },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'User synchronized with MongoDB successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error syncing auth user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to sync user with MongoDB',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/me
 * Retrieves current authenticated user from MongoDB.
 */
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: req.user,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user',
      error: error.message,
    });
  }
};
