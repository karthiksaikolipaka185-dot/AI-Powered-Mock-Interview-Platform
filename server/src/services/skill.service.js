const mongoose = require('mongoose');
const SkillProfile = require('../models/SkillProfile.model');
const Interview = require('../models/Interview.model');

// Canonical skill normalization taxonomy map
const CANONICAL_SKILL_MAP = {
    'js': { name: 'JavaScript', category: 'Technical' },
    'javascript': { name: 'JavaScript', category: 'Technical' },
    'ecmascript': { name: 'JavaScript', category: 'Technical' },
    'react': { name: 'React', category: 'Technical' },
    'reactjs': { name: 'React', category: 'Technical' },
    'react.js': { name: 'React', category: 'Technical' },
    'node': { name: 'Node.js', category: 'Technical' },
    'nodejs': { name: 'Node.js', category: 'Technical' },
    'node.js': { name: 'Node.js', category: 'Technical' },
    'express': { name: 'Node.js', category: 'Technical' },
    'sql': { name: 'Databases', category: 'Database' },
    'postgres': { name: 'Databases', category: 'Database' },
    'postgresql': { name: 'Databases', category: 'Database' },
    'mysql': { name: 'Databases', category: 'Database' },
    'database': { name: 'Databases', category: 'Database' },
    'databases': { name: 'Databases', category: 'Database' },
    'mongodb': { name: 'MongoDB', category: 'Database' },
    'nosql': { name: 'MongoDB', category: 'Database' },
    'problem solving & coding': { name: 'Problem Solving & Coding', category: 'Coding' },
    'coding': { name: 'Problem Solving & Coding', category: 'Coding' },
    'algorithms': { name: 'Problem Solving & Coding', category: 'Coding' },
    'data structures': { name: 'Problem Solving & Coding', category: 'Coding' },
    'system design': { name: 'System Design & Architecture', category: 'System Design' },
    'system design & architecture': { name: 'System Design & Architecture', category: 'System Design' },
    'architecture': { name: 'System Design & Architecture', category: 'System Design' },
    'communication': { name: 'Communication', category: 'Communication' },
    'verbal communication': { name: 'Communication', category: 'Communication' },
    'soft skills': { name: 'Communication', category: 'Communication' }
};

// Target Role Benchmarks
const ROLE_BENCHMARKS = {
    'Frontend Developer': [
        { name: 'JavaScript', category: 'Technical', benchmark: 7.5 },
        { name: 'React', category: 'Technical', benchmark: 7.5 },
        { name: 'Problem Solving & Coding', category: 'Coding', benchmark: 6.5 },
        { name: 'Communication', category: 'Communication', benchmark: 6.5 }
    ],
    'Backend Developer': [
        { name: 'Node.js', category: 'Technical', benchmark: 7.5 },
        { name: 'Databases', category: 'Database', benchmark: 7.0 },
        { name: 'System Design & Architecture', category: 'System Design', benchmark: 6.5 },
        { name: 'Problem Solving & Coding', category: 'Coding', benchmark: 7.0 }
    ],
    'Full Stack Engineer': [
        { name: 'JavaScript', category: 'Technical', benchmark: 7.0 },
        { name: 'Node.js', category: 'Technical', benchmark: 7.0 },
        { name: 'Databases', category: 'Database', benchmark: 6.5 },
        { name: 'Problem Solving & Coding', category: 'Coding', benchmark: 7.0 },
        { name: 'System Design & Architecture', category: 'System Design', benchmark: 6.0 }
    ],
    'Software Engineer': [
        { name: 'Problem Solving & Coding', category: 'Coding', benchmark: 7.5 },
        { name: 'JavaScript', category: 'Technical', benchmark: 7.0 },
        { name: 'Node.js', category: 'Technical', benchmark: 7.0 },
        { name: 'System Design & Architecture', category: 'System Design', benchmark: 6.0 },
        { name: 'Communication', category: 'Communication', benchmark: 6.5 }
    ]
};

const normalizeSkill = (rawCategory) => {
    if (!rawCategory) return { name: 'General Technical', category: 'Technical' };
    const key = String(rawCategory).trim().toLowerCase();
    if (CANONICAL_SKILL_MAP[key]) {
        return CANONICAL_SKILL_MAP[key];
    }
    
    // Partial substring matches
    for (const [mapKey, mapVal] of Object.entries(CANONICAL_SKILL_MAP)) {
        if (key.includes(mapKey) || mapKey.includes(key)) {
            return mapVal;
        }
    }

    // Title case fallback
    const titleName = String(rawCategory)
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    
    return { name: titleName, category: 'Technical' };
};

const calculateTrend = (historyList) => {
    if (!historyList || historyList.length < 2) {
        return 'insufficient_data';
    }
    const recent = historyList.slice(-5);
    const latestScore = recent[recent.length - 1].score;
    const previousScores = recent.slice(0, recent.length - 1).map(h => h.score);
    const prevAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
    
    const delta = latestScore - prevAvg;
    if (delta >= 0.5) return 'improving';
    if (delta <= -0.5) return 'declining';
    return 'stable';
};

const getSkillsObject = (skillsData) => {
    if (!skillsData) return {};
    if (typeof skillsData.toObject === 'function') {
        skillsData = skillsData.toObject();
    }
    if (Array.isArray(skillsData)) {
        const obj = {};
        for (const item of skillsData) {
            if (item && item.name) {
                obj[item.name] = item;
            }
        }
        return obj;
    }
    return typeof skillsData === 'object' ? skillsData : {};
};

const updateSkillProfileFromInterview = async (userId, interview) => {
    try {
        if (!userId || !interview) return null;
        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(String(userId)) : userId;

        let profile = await SkillProfile.findOne({ userId: userObjId });
        if (!profile) {
            profile = new SkillProfile({
                userId: userObjId,
                targetRole: interview.role || 'Full Stack Engineer',
                skills: {}
            });
        }

        if (interview.role) {
            profile.targetRole = interview.role;
        }

        const skillsObj = getSkillsObject(profile.skills);
        const extractedScores = {};

        // 1. Process categoryScores from performanceTracker
        if (interview.performanceTracker && interview.performanceTracker.categoryScores) {
            for (const [catName, catScore] of Object.entries(interview.performanceTracker.categoryScores)) {
                if (typeof catScore === 'number' && !isNaN(catScore)) {
                    const norm = normalizeSkill(catName);
                    extractedScores[norm.name] = {
                        category: norm.category,
                        score: catScore
                    };
                }
            }
        }

        // 2. Process evaluations array
        if (Array.isArray(interview.evaluations) && interview.evaluations.length > 0) {
            for (const ev of interview.evaluations) {
                const catName = ev.category || 'Core Technical Concepts';
                const norm = normalizeSkill(catName);
                const scoreVal = typeof ev.overallScore === 'number' ? ev.overallScore : (ev.technicalScore || 7);
                if (!extractedScores[norm.name]) {
                    extractedScores[norm.name] = { category: norm.category, score: scoreVal };
                } else {
                    extractedScores[norm.name].score = Math.round(((extractedScores[norm.name].score + scoreVal) / 2) * 10) / 10;
                }
            }
        }

        // 3. Process Code Submissions
        if (Array.isArray(interview.codeSubmissions) && interview.codeSubmissions.length > 0) {
            const lastCode = interview.codeSubmissions[interview.codeSubmissions.length - 1];
            if (lastCode && typeof lastCode.correctnessScore === 'number') {
                const norm = normalizeSkill('Problem Solving & Coding');
                extractedScores[norm.name] = {
                    category: norm.category,
                    score: lastCode.correctnessScore
                };
            }
        }

        // Apply extracted scores to skills object
        const now = new Date();
        const interviewId = interview._id;
        const role = interview.role || profile.targetRole;

        for (const [skillName, skillData] of Object.entries(extractedScores)) {
            let skillItem = skillsObj[skillName];

            if (!skillItem) {
                skillsObj[skillName] = {
                    name: skillName,
                    category: skillData.category,
                    score: skillData.score,
                    confidence: 0.5,
                    assessmentCount: 1,
                    lastAssessedAt: now,
                    trend: 'insufficient_data',
                    history: [{
                        interviewId,
                        score: skillData.score,
                        assessedAt: now,
                        role
                    }]
                };
            } else {
                if (!Array.isArray(skillItem.history)) skillItem.history = [];
                const existsInHistory = skillItem.history.some(h => String(h.interviewId) === String(interviewId));
                if (!existsInHistory) {
                    skillItem.history.push({
                        interviewId,
                        score: skillData.score,
                        assessedAt: now,
                        role
                    });

                    const newScore = (!skillItem.assessmentCount || skillItem.assessmentCount < 1)
                        ? skillData.score
                        : Math.round((0.35 * skillData.score + 0.65 * (skillItem.score || 7)) * 10) / 10;

                    let confidenceBoost = 0;
                    if (Array.isArray(interview.evidenceValidations) && interview.evidenceValidations.length > 0) {
                        const supportedCount = interview.evidenceValidations.filter(ev => ev.evidenceStatus === 'supported').length;
                        confidenceBoost = supportedCount * 0.05;
                    }
                    skillItem.confidence = Math.min(1, Math.round((0.4 + skillItem.assessmentCount * 0.15 + confidenceBoost) * 100) / 100);
                    skillItem.trend = calculateTrend(skillItem.history);
                    skillsObj[skillName] = skillItem;
                }
            }
        }

        profile.skills = skillsObj;
        profile.markModified('skills');

        // Calculate Overall Metrics
        const allCompleted = await Interview.countDocuments({ userId, status: 'completed' });
        profile.overallMetrics.totalInterviewsCompleted = allCompleted;

        const skillValues = Object.values(skillsObj);
        if (skillValues.length > 0) {
            const avgSum = skillValues.reduce((acc, s) => acc + (s.score || 0), 0);
            profile.overallMetrics.overallAverageScore = Math.round((avgSum / skillValues.length) * 10) / 10;

            const sortedSkills = [...skillValues].sort((a, b) => b.score - a.score);
            profile.overallMetrics.strongestSkill = sortedSkills[0]?.name || '';
            profile.overallMetrics.weakestSkill = sortedSkills[sortedSkills.length - 1]?.name || '';
        }
        profile.overallMetrics.lastCalculatedAt = now;

        await profile.save();
        console.log(`[updateSkillProfileFromInterview] Updated SkillProfile for userId: ${userId}`);
        return profile;
    } catch (err) {
        console.error('[updateSkillProfileFromInterview] Failed to update skill profile:', err);
        return null;
    }
};

const calculateSkillGaps = (profile) => {
    const roleKey = profile.targetRole && ROLE_BENCHMARKS[profile.targetRole] 
        ? profile.targetRole 
        : 'Full Stack Engineer';
        
    const benchmarks = ROLE_BENCHMARKS[roleKey] || ROLE_BENCHMARKS['Full Stack Engineer'];
    const skillsObj = getSkillsObject(profile.skills);
    const userSkillsList = Object.values(skillsObj);

    const gaps = [];
    const strongSkills = [];
    const weakSkills = [];
    const improvingSkills = [];
    const decliningSkills = [];

    for (const bm of benchmarks) {
        const userSkill = userSkillsList.find(s => s && s.name && s.name.toLowerCase() === (bm.name || '').toLowerCase());
        const currentScore = userSkill ? userSkill.score : 0;
        const deficit = Math.round((bm.benchmark - currentScore) * 10) / 10;

        if (!userSkill || currentScore < bm.benchmark - 0.5) {
            gaps.push({
                skill: bm.name,
                category: bm.category,
                currentScore: currentScore,
                targetBenchmark: bm.benchmark,
                deficit: Math.max(0, deficit),
                status: userSkill ? 'Below Target' : 'Not Assessed'
            });
        }
    }

    for (const sItem of userSkillsList) {
        if (sItem.score >= 7.5 && sItem.assessmentCount >= 1) {
            strongSkills.push(sItem);
        } else if (sItem.score < 6.0) {
            weakSkills.push(sItem);
        }

        if (sItem.trend === 'improving') {
            improvingSkills.push(sItem);
        } else if (sItem.trend === 'declining') {
            decliningSkills.push(sItem);
        }
    }

    return {
        targetRole: roleKey,
        gaps,
        strongSkills,
        weakSkills,
        improvingSkills,
        decliningSkills
    };
};

const getSkillProfileByUserId = async (userId) => {
    if (!userId) return null;
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(String(userId)) : userId;
    let profile = await SkillProfile.findOne({ userId: userObjId });
    
    // If no profile exists yet, create an initial shell or sync from history
    if (!profile) {
        const completedInterviews = await Interview.find({ userId: userObjId, status: 'completed' }).sort({ createdAt: 1 });
        if (completedInterviews.length > 0) {
            for (const inv of completedInterviews) {
                profile = await updateSkillProfileFromInterview(userObjId, inv);
            }
        } else {
            profile = new SkillProfile({
                userId: userObjId,
                targetRole: 'Full Stack Engineer',
                skills: {}
            });
            await profile.save();
        }
    }

    const gapAnalysis = calculateSkillGaps(profile);

    return {
        profile,
        gapAnalysis
    };
};

module.exports = {
    updateSkillProfileFromInterview,
    getSkillProfileByUserId,
    calculateSkillGaps,
    normalizeSkill
};
