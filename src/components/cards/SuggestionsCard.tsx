import React, { useState } from 'react';
import { Wand2, Copy, Check, ArrowRight, Zap, Target } from 'lucide-react';
import { ActionableSuggestion } from '../../types';
import { useTilt } from '../../hooks/useTilt';
import { audioFX } from '../../utils/audioFX';

interface SuggestionsCardProps {
  suggestions: ActionableSuggestion[];
}

export const SuggestionsCard: React.FC<SuggestionsCardProps> = ({ suggestions }) => {
  const { ref, cardStyle, glareStyle, onMouseMove, onMouseLeave } = useTilt(6);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>(suggestions[0]?.id || '');

  const handleCopy = (id: string, textToCopy: string) => {
    audioFX.playClick();
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeSuggestion = suggestions.find(s => s.id === activeTabId) || suggestions[0];

  return (
    <div
      ref={ref}
      style={cardStyle}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={() => audioFX.playHover()}
      className="tilt-card glass-surface rounded-3xl p-6 sm:p-7 border border-vanilla/15 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
    >
      {/* Specular glare */}
      <div className="absolute inset-0 pointer-events-none" style={glareStyle} />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-vanilla tracking-tight">Actionable Optimizations</h4>
              <span className="text-[10px] font-mono text-vanilla-muted uppercase">Strategic Rewrites</span>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-brunswick/50 border border-vanilla/20 text-vanilla text-[11px] font-mono">
            {suggestions.length} Levers
          </div>
        </div>

        {/* Suggestion Selector Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-vanilla/10 no-scrollbar">
          {suggestions.map((s, index) => {
            const isActive = (activeSuggestion?.id === s.id);
            return (
              <button
                key={s.id}
                onClick={() => {
                  audioFX.playClick();
                  setActiveTabId(s.id);
                }}
                onMouseEnter={() => audioFX.playHover()}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-tangerine text-darkbrown-deep font-bold border-tangerine shadow-[0_0_12px_#EB7D00]'
                    : 'bg-darkbrown/50 text-vanilla-muted hover:text-vanilla border-vanilla/10 hover:bg-brunswick/40'
                }`}
              >
                <span>Lever 0{index + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Active Suggestion Content */}
        {activeSuggestion && (
          <div className="my-4 space-y-3.5">
            {/* Title & ROI */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="text-sm font-semibold text-vanilla tracking-tight">
                  {activeSuggestion.title}
                </h5>
                <p className="text-xs text-vanilla-soft/90 mt-1 leading-relaxed">
                  {activeSuggestion.rationale}
                </p>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brunswick/60 text-vanilla border border-vanilla/20 flex-shrink-0">
                Effort: {activeSuggestion.effort}
              </span>
            </div>

            {/* Smart Rewrite Comparison Box */}
            <div className="rounded-2xl bg-darkbrown/80 border border-vanilla/15 overflow-hidden">
              {activeSuggestion.originalSnippet && (
                <div className="p-3 border-b border-vanilla/10 bg-darkbrown/90 text-xs">
                  <div className="text-[10px] font-mono text-vanilla-muted uppercase mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-vanilla/40" />
                    <span>Baseline / Source Text</span>
                  </div>
                  <p className="text-vanilla-muted italic">"{activeSuggestion.originalSnippet}"</p>
                </div>
              )}

              {/* Solis Optimized Version */}
              <div className="p-3.5 bg-gradient-to-br from-brunswick/40 to-darkbrown/60 relative">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1.5">
                  <span className="text-tangerine flex items-center gap-1 font-bold">
                    <Zap className="w-3 h-3" />
                    <span>Solis Synthesized Directive</span>
                  </span>

                  <button
                    onClick={() => handleCopy(activeSuggestion.id, activeSuggestion.improvedVersion)}
                    className="flex items-center gap-1 text-[11px] font-sans text-vanilla-soft hover:text-white px-2 py-0.5 rounded bg-brunswick/60 hover:bg-tangerine/30 border border-vanilla/20 transition-all"
                  >
                    {copiedId === activeSuggestion.id ? (
                      <>
                        <Check className="w-3 h-3 text-tangerine" />
                        <span className="text-tangerine font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-vanilla leading-relaxed font-medium">
                  {activeSuggestion.improvedVersion}
                </p>
              </div>
            </div>

            {/* Projected Gain Badge */}
            <div className="p-2.5 rounded-xl bg-tangerine/10 border border-tangerine/30 flex items-center justify-between text-xs">
              <span className="text-vanilla-soft flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-tangerine" />
                <span>Projected Strategic Gain</span>
              </span>
              <span className="font-mono text-tangerine font-bold">
                {activeSuggestion.expectedGain}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-vanilla/10 flex items-center justify-between text-[11px] font-mono text-vanilla-muted">
        <span>Prescriptive Cognitive Modeling</span>
        <span className="flex items-center gap-1 text-vanilla-soft">
          <span>Apply to draft</span>
          <ArrowRight className="w-3 h-3 text-tangerine" />
        </span>
      </div>

    </div>
  );
};
