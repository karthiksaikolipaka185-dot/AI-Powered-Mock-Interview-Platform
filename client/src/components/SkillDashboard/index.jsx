import React, { useEffect, useState } from 'react';
import { getSkillProfile, recalculateSkillProfile } from '../../services/skillService';
import { 
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    ResponsiveContainer,
    Tooltip 
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    Minus, 
    Award, 
    AlertTriangle, 
    CheckCircle2, 
    RefreshCw, 
    Target, 
    Zap,
    BookOpen
} from 'lucide-react';

const SkillDashboard = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSkillProfile();
            setProfileData(data);
        } catch (err) {
            console.error('[SkillDashboard] Fetch error:', err);
            setError('Unable to load skill analytics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleRecalculate = async () => {
        try {
            setRecalculating(true);
            const updated = await recalculateSkillProfile();
            setProfileData(updated);
        } catch (err) {
            console.error('[SkillDashboard] Recalculation error:', err);
        } finally {
            setRecalculating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-card rounded-3xl border border-border-theme p-8 card-shadow flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
                    <p className="text-text-secondary text-sm font-medium">Analyzing candidate skill mastery...</p>
                </div>
            </div>
        );
    }

    if (error || !profileData || !profileData.profile) {
        return (
            <div className="bg-card rounded-3xl border border-border-theme p-8 card-shadow text-center">
                <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-text-main">Skill Tracking Unavailable</h3>
                <p className="text-sm text-text-secondary mt-1 mb-6">Complete a mock interview to generate your persistent skill profile.</p>
                <button
                    onClick={fetchProfile}
                    className="px-5 py-2.5 bg-primary-theme text-white text-sm font-semibold rounded-xl hover:bg-primary-theme-hover transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const { profile, gapAnalysis } = profileData;
    const skillsMap = profile.skills || {};
    const skillList = Object.values(skillsMap);

    // Prepare Recharts Radar Data
    const radarData = skillList.map(s => ({
        subject: s.name,
        score: s.score,
        fullMark: 10
    }));

    const renderTrendBadge = (trend) => {
        switch (trend) {
            case 'improving':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <TrendingUp size={14} /> Improving
                    </span>
                );
            case 'declining':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <TrendingDown size={14} /> Declining
                    </span>
                );
            case 'stable':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Minus size={14} /> Stable
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-text-secondary border border-border-theme">
                        Building Data
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider uppercase bg-primary-500/10 text-primary-theme rounded-full border border-primary-500/20 mb-2">
                        Phase 3 Intelligence
                    </span>
                    <h2 className="text-2xl font-bold text-text-main">Skill Gap & Improvement Tracking</h2>
                    <p className="text-text-secondary text-sm">Target Role: <strong className="text-text-main">{profile.targetRole || 'Full Stack Engineer'}</strong></p>
                </div>
                <button
                    onClick={handleRecalculate}
                    disabled={recalculating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-accent-theme border border-border-theme text-text-main rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={recalculating ? 'animate-spin text-primary-theme' : 'text-text-secondary'} />
                    {recalculating ? 'Syncing...' : 'Sync Profile'}
                </button>
            </div>

            {/* Quick Skill Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-card p-5 rounded-2xl border border-border-theme card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-xs font-bold uppercase mb-2">
                        <span>Overall Mastery</span>
                        <Zap size={18} className="text-amber-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-text-main">{profile.overallMetrics?.overallAverageScore || 0}<span className="text-sm font-normal text-text-secondary">/10</span></div>
                    <p className="text-xs text-text-secondary mt-1">Across {profile.overallMetrics?.totalInterviewsCompleted || 0} completed sessions</p>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border-theme card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-xs font-bold uppercase mb-2">
                        <span>Strongest Domain</span>
                        <Award size={18} className="text-emerald-500" />
                    </div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">{profile.overallMetrics?.strongestSkill || 'N/A'}</div>
                    <p className="text-xs text-text-secondary mt-1">Top performing area</p>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border-theme card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-xs font-bold uppercase mb-2">
                        <span>Focus Growth Area</span>
                        <AlertTriangle size={18} className="text-rose-500" />
                    </div>
                    <div className="text-xl font-bold text-rose-600 dark:text-rose-400 truncate">{profile.overallMetrics?.weakestSkill || 'N/A'}</div>
                    <p className="text-xs text-text-secondary mt-1">Target for next interview</p>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border-theme card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-xs font-bold uppercase mb-2">
                        <span>Skill Gaps Flagged</span>
                        <Target size={18} className="text-primary-theme" />
                    </div>
                    <div className="text-3xl font-extrabold text-primary-theme">{gapAnalysis?.gaps?.length || 0}</div>
                    <p className="text-xs text-text-secondary mt-1">Relative to {profile.targetRole}</p>
                </div>
            </div>

            {/* Radar Chart & Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Radar Chart Column */}
                <div className="lg:col-span-5 bg-card p-6 rounded-3xl border border-border-theme card-shadow flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-text-main mb-1">Multi-Dimensional Coverage</h3>
                        <p className="text-xs text-text-secondary mb-4">Competency Radar visualization across technical dimensions</p>
                    </div>

                    {radarData.length > 2 ? (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="currentColor" className="text-border-theme opacity-50" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11 }} className="text-text-secondary font-medium" />
                                    <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="currentColor" className="text-border-theme opacity-30" />
                                    <Radar name="Candidate Skill" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card, #1f2937)', borderColor: 'var(--color-border-theme, #374151)', borderRadius: '12px', color: '#fff' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-center p-6 bg-accent-theme/30 rounded-2xl border border-dashed border-border-theme">
                            <p className="text-xs text-text-secondary">Radar visualization unlocks after assessing 3+ skill categories.</p>
                        </div>
                    )}
                </div>

                {/* Skill List & Trends Column */}
                <div className="lg:col-span-7 bg-card p-6 rounded-3xl border border-border-theme card-shadow space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-text-main">Persistent Skill Vector</h3>
                            <p className="text-xs text-text-secondary">Calculated via recency-weighted exponential moving average</p>
                        </div>
                    </div>

                    {skillList.length > 0 ? (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {skillList.map((skill) => (
                                <div key={skill.name} className="p-4 rounded-2xl bg-accent-theme/40 border border-border-theme hover:border-primary-theme/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-text-main text-sm">{skill.name}</h4>
                                            {renderTrendBadge(skill.trend)}
                                        </div>
                                        <div className="text-xs text-text-secondary flex items-center gap-3">
                                            <span>Category: <strong>{skill.category}</strong></span>
                                            <span>•</span>
                                            <span>{skill.assessmentCount} Assessment{skill.assessmentCount > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-24 bg-border-theme/40 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${skill.score >= 7.5 ? 'bg-emerald-500' : skill.score >= 6.0 ? 'bg-primary-theme' : 'bg-amber-500'}`}
                                                style={{ width: `${(skill.score / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-base font-extrabold text-text-main w-10 text-right">{skill.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-accent-theme/30 rounded-2xl border border-dashed border-border-theme">
                            <BookOpen size={32} className="text-text-secondary mx-auto mb-2" />
                            <p className="text-sm font-semibold text-text-main">No persistent skills recorded yet.</p>
                            <p className="text-xs text-text-secondary mt-1">Complete your first interview session to begin building your skill vector.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Target Role Skill Gap Analysis */}
            {gapAnalysis && gapAnalysis.gaps && (
                <div className="bg-card p-6 rounded-3xl border border-border-theme card-shadow space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-theme">
                            <Target size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-main">Target Role Skill Gap Analysis</h3>
                            <p className="text-xs text-text-secondary">Benchmark comparison against standards for <strong>{gapAnalysis.targetRole}</strong></p>
                        </div>
                    </div>

                    {gapAnalysis.gaps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {gapAnalysis.gaps.map((gap) => (
                                <div key={gap.skill} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                                    <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-text-main">{gap.skill}</h4>
                                        <p className="text-xs text-text-secondary">
                                            Current: <strong className="text-amber-600 dark:text-amber-400">{gap.currentScore || 'Unassessed'}</strong> / Required Benchmark: <strong>{gap.targetBenchmark}</strong>
                                        </p>
                                        <p className="text-xs text-text-secondary/80 italic pt-0.5">
                                            Recommendation: Practice more {gap.skill} interview questions to close the {gap.deficit > 0 ? `${gap.deficit}-point` : ''} gap.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                            <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-text-main">100% Role Target Alignment</h4>
                                <p className="text-xs text-text-secondary">Your current skill profile meets or exceeds all target benchmark requirements for {gapAnalysis.targetRole}!</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SkillDashboard;
