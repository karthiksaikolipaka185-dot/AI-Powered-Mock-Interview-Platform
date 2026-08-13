import React from 'react';
import { Briefcase, Code, Award, CheckCircle, FileText } from 'lucide-react';

const ResumeHighlights = ({ parsedData, fileName }) => {
  if (!parsedData) return null;

  const { workExperience = [], projects = [], technicalSkills = [], verifiableClaims = [] } = parsedData;

  const hasContent = workExperience.length > 0 || projects.length > 0 || technicalSkills.length > 0 || verifiableClaims.length > 0;

  if (!hasContent) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 mb-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Resume Intelligence Model</h3>
            <p className="text-xs text-slate-400">{fileName || 'Parsed Candidate Resume'}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5" />
          Deep-Dive Ready
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projects & Work */}
        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Briefcase className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Key Experience & Projects</h4>
          </div>
          <div className="space-y-2">
            {projects.slice(0, 2).map((proj, idx) => (
              <div key={idx} className="text-xs">
                <p className="font-medium text-slate-200">{proj.title}</p>
                <p className="text-slate-400 text-[11px] line-clamp-1">{proj.description}</p>
              </div>
            ))}
            {projects.length === 0 && workExperience.slice(0, 2).map((exp, idx) => (
              <div key={idx} className="text-xs">
                <p className="font-medium text-slate-200">{exp.title} @ {exp.company}</p>
                <p className="text-slate-400 text-[11px]">{exp.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-2 text-sky-400 mb-2">
            <Code className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Extracted Tech Stack</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {technicalSkills.flatMap(s => s.skills || []).slice(0, 8).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Verifiable Claims */}
        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Award className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Metric Claims for Probing</h4>
          </div>
          <div className="space-y-1.5">
            {verifiableClaims.slice(0, 2).map((claim, idx) => (
              <div key={idx} className="text-xs text-amber-200/90 bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                <span className="font-medium">{claim.metric || claim.claimText}</span>
              </div>
            ))}
            {verifiableClaims.length === 0 && (
              <p className="text-xs text-slate-400 italic">No specific metric claims detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeHighlights;
