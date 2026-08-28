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
    BookOpen,
    Sparkles
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
            <div className="bg-card rounded-2xl border border-border-theme p-6 sm:p-8 auth-card-shadow flex items-center justify-center min-h-[260px] animate-pulse">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-theme"></div>
                    <p className="text-text-secondary text-xs sm:text-sm font-semibold">Analyzing candidate skill mastery & gap vectors...</p>
                </div>
            </div>
        );
    }

    if (error || !profileData || !profileData.profile) {
        return (
            <div className="bg-card rounded-2xl border border-border-theme p-6 sm:p-8 auth-card-shadow text-center">
                <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-text-main">Skill Tracking Unavailable</h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 mb-5">Complete a mock interview to generate your persistent skill profile.</p>
                <button
                    onClick={fetchProfile}
                    className="px-4 py-2 bg-primary-theme text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary-theme-hover transition-all cursor-pointer"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    const { profile, gapAnalysis } = profileData;
    const skillsMap = profile.skills || {};
    const skillList = Object.values(skillsMap);

    const radarData = skillList.map(s => ({
        subject: s.name,
        score: s.score,
        fullMark: 10
    }));

    const renderTrendBadge = (trend) => {
        switch (trend) {
            case 'improving':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <TrendingUp size={12} /> Improving
                    </span>
                );
            case 'declining':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <TrendingDown size={12} /> Declining
                    </span>
                );
            case 'stable':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-theme/10 text-primary-theme border border-primary-theme/20">
                        <Minus size={12} /> Stable
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent-theme text-text-secondary border border-border-theme">
                        Building Data
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-theme/10 border border-primary-theme/20 mb-1.5">
                        <Sparkles size={14} className="text-primary-theme" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-theme">Skill Intelligence</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">Skill Gap & Competency Analysis</h2>
                    <p className="text-text-secondary text-xs sm:text-sm font-medium">Target Role: <strong className="text-text-main">{profile.targetRole || 'Full Stack Engineer'}</strong></p>
                </div>
                
                <button
                    onClick={handleRecalculate}
                    disabled={recalculating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-accent-theme border border-border-theme text-text-main rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                    <RefreshCw size={15} className={recalculating ? 'animate-spin text-primary-theme' : 'text-text-secondary'} />
                    <span>{recalculating ? 'Syncing Profile...' : 'Sync Skill Profile'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-2xl border border-border-theme auth-card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">
                        <span>Overall Mastery</span>
                        <Zap size={16} className="text-amber-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-text-main">{profile.overallMetrics?.overallAverageScore || 0}<span className="text-xs font-normal text-text-secondary">/10</span></div>
                    <p className="text-xs text-text-secondary font-medium mt-1">Across {profile.overallMetrics?.totalInterviewsCompleted || 0} completed sessions</p>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border-theme auth-card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">
                        <span>Strongest Domain</span>
                        <Award size={16} className="text-emerald-500" />
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">{profile.overallMetrics?.strongestSkill || 'N/A'}</div>
                    <p className="text-xs text-text-secondary font-medium mt-1">Top performing category</p>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border-theme auth-card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">
                        <span>Focus Growth Area</span>
                        <AlertTriangle size={16} className="text-rose-500" />
                    </div>
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-400 truncate">{profile.overallMetrics?.weakestSkill || 'N/A'}</div>
                    <p className="text-xs text-text-secondary font-medium mt-1">Target area for next session</p>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border-theme auth-card-shadow">
                    <div className="flex items-center justify-between text-text-secondary text-[11px] font-bold uppercase tracking-wider mb-2">
                        <span>Skill Gaps Flagged</span>
                        <Target size={16} className="text-primary-theme" />
                    </div>
                    <div className="text-3xl font-extrabold text-primary-theme">{gapAnalysis?.gaps?.length || 0}</div>
                    <p className="text-xs text-text-secondary font-medium mt-1">Relative to benchmark role</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-card p-5 sm:p-6 rounded-2xl border border-border-theme auth-card-shadow flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-text-main mb-0.5">Multi-Dimensional Coverage</h3>
                        <p className="text-xs text-text-secondary font-medium mb-4">Competency radar chart across technical dimensions</p>
                    </div>

                    {radarData.length > 2 ? (
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                                    <PolarGrid stroke="currentColor" className="text-border-theme opacity-50" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11 }} className="text-text-secondary font-semibold" />
                                    <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="currentColor" className="text-border-theme opacity-30" />
                                    <Radar name="Candidate Skill" dataKey="score" stroke="#4f6ef5" fill="#4f6ef5" fillOpacity={0.35} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-card, #111827)', borderColor: 'var(--color-border-theme, #1f2937)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-center p-6 bg-accent-theme/40 rounded-xl border border-dashed border-border-theme">
                            <p className="text-xs text-text-secondary font-medium">Radar visualization unlocks after assessing 3+ skill categories.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-7 bg-card p-5 sm:p-6 rounded-2xl border border-border-theme auth-card-shadow space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-text-main">Persistent Skill Vector</h3>
                            <p className="text-xs text-text-secondary font-medium">Calculated via recency-weighted performance evaluation</p>
                        </div>
                    </div>

                    {skillList.length > 0 ? (
                        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                            {skillList.map((skill) => (
                                <div key={skill.name} className="p-3.5 rounded-xl bg-accent-theme/40 border border-border-theme hover:border-primary-theme/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-text-main text-sm">{skill.name}</h4>
                                            {renderTrendBadge(skill.trend)}
                                        </div>
                                        <div className="text-xs text-text-secondary flex items-center gap-2 font-medium">
                                            <span>Category: <strong className="text-text-main">{skill.category}</strong></span>
                                            <span>•</span>
                                            <span>{skill.assessmentCount} Assessment{skill.assessmentCount > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-border-theme/40 h-2 rounded-full overflow-hidden shrink-0">
                                            <div 
                                                className={"h-full rounded-full transition-all duration-500 " + (skill.score >= 7.5 ? 'bg-emerald-500' : skill.score >= 6.0 ? 'bg-primary-theme' : 'bg-amber-500')}
                                                style={{ width: ((skill.score / 10) * 100) + "%" }}
                                            />
                                        </div>
                                        <span className="text-sm font-extrabold text-text-main w-8 text-right shrink-0">{skill.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center bg-accent-theme/40 rounded-xl border border-dashed border-border-theme">
                            <BookOpen size={28} className="text-text-secondary mx-auto mb-2" />
                            <p className="text-xs sm:text-sm font-bold text-text-main">No persistent skills recorded yet.</p>
                            <p className="text-xs text-text-secondary font-medium mt-0.5">Complete your first interview session to start building your skill vector.</p>
                        </div>
                    )}
                </div>
            </div>

            {gapAnalysis && gapAnalysis.gaps && (
                <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border-theme auth-card-shadow space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary-theme/10 text-primary-theme shrink-0">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-text-main">Target Role Skill Gap Analysis</h3>
                            <p className="text-xs text-text-secondary font-medium">Benchmark comparison against standards for <strong>{gapAnalysis.targetRole}</strong></p>
                        </div>
                    </div>

                    {gapAnalysis.gaps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {gapAnalysis.gaps.map((gap) => (
                                <div key={gap.skill} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <h4 className="text-xs sm:text-sm font-bold text-text-main">{gap.skill}</h4>
                                        <p className="text-xs text-text-secondary font-medium">
                                            Current: <strong className="text-amber-600 dark:text-amber-400">{gap.currentScore || 'Unassessed'}</strong> / Required Benchmark: <strong>{gap.targetBenchmark}</strong>
                                        </p>
                                        <p className="text-xs text-text-secondary/80 italic pt-0.5">
                                            Recommendation: Practice more {gap.skill} interview questions to close the {gap.deficit > 0 ? (gap.deficit + "-point") : ''} gap.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-text-main">100% Role Target Alignment</h4>
                                <p className="text-xs text-text-secondary font-medium">Your current skill profile meets or exceeds all target benchmark requirements for {gapAnalysis.targetRole}!</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SkillDashboard;
