import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle, Info, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  supported: {
    label: 'Supported',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    icon: CheckCircle2
  },
  partially_supported: {
    label: 'Partially Supported',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    icon: AlertTriangle
  },
  insufficient_evidence: {
    label: 'Insufficient Evidence',
    bg: 'bg-slate-800/50',
    border: 'border-slate-700/50',
    text: 'text-slate-400',
    badgeBg: 'bg-slate-700/50 text-slate-300',
    icon: Info
  },
  needs_clarification: {
    label: 'Needs Clarification',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300',
    icon: HelpCircle
  }
};

const ResumeRealityCheck = ({ evidenceValidations = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!evidenceValidations || evidenceValidations.length === 0) {
    return null;
  }

  const supportedCount = evidenceValidations.filter(ev => ev.evidenceStatus === 'supported').length;
  const totalCount = evidenceValidations.length;

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Resume Reality Check & Evidence Validation
            </h3>
            <p className="text-xs text-slate-400">
              Objective technical evidence analysis linking interview responses to resume claims
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Claims Verified:</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {supportedCount} / {totalCount} Supported
          </span>
        </div>
      </div>

      {/* Validation Cards List */}
      <div className="space-y-4">
        {evidenceValidations.map((item, idx) => {
          const config = STATUS_CONFIG[item.evidenceStatus] || STATUS_CONFIG.insufficient_evidence;
          const StatusIcon = config.icon;
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-xl border ${config.border} ${config.bg} transition-all duration-200 overflow-hidden`}
            >
              <div
                onClick={() => toggleExpand(idx)}
                className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeBg}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                    {item.confidenceRating && (
                      <span className="text-[11px] text-slate-400">
                        Confidence: {Math.round(item.confidenceRating * 100)}%
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    "{item.claimText}"
                  </p>
                </div>

                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Toggle details"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded Evidence Detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/40 space-y-3 text-xs">
                  {item.questionAsked && (
                    <div>
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Question Asked</span>
                      <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        "{item.questionAsked}"
                      </p>
                    </div>
                  )}

                  {item.candidateResponse && (
                    <div>
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Candidate Answer Evidence</span>
                      <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 line-clamp-3">
                        "{item.candidateResponse}"
                      </p>
                    </div>
                  )}

                  {item.reasoning && (
                    <div>
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Objective AI Analysis</span>
                      <p className="text-slate-300 bg-indigo-950/30 text-indigo-200/90 p-2.5 rounded-lg border border-indigo-900/30">
                        {item.reasoning}
                      </p>
                    </div>
                  )}

                  {item.extractedEvidence && item.extractedEvidence.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Extracted Technical Keywords / Metrics</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {item.extractedEvidence.map((ev, eIdx) => (
                          <span key={eIdx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResumeRealityCheck;
