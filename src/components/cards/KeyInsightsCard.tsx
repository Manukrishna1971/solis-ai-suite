import React, { useState } from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { KeyInsight } from '../../types';
import { useTilt } from '../../hooks/useTilt';
import { audioFX } from '../../utils/audioFX';

interface KeyInsightsCardProps {
  insights: KeyInsight[];
}

export const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({ insights }) => {
  const { ref, cardStyle, glareStyle, onMouseMove, onMouseLeave } = useTilt(6);
  const [expandedId, setExpandedId] = useState<string | null>(insights[0]?.id || null);

  const toggleExpand = (id: string) => {
    audioFX.playClick();
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Critical Risk':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'Strategic Advantage':
        return <ShieldCheck className="w-3.5 h-3.5 text-tangerine" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-vanilla" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'Critical':
        return 'bg-amber-900/40 text-amber-400 border-amber-700/50';
      case 'High':
        return 'bg-tangerine/20 text-tangerine border-tangerine/40';
      default:
        return 'bg-brunswick/50 text-vanilla border-vanilla/20';
    }
  };

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
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-vanilla tracking-tight">Key Strategic Insights</h4>
              <span className="text-[10px] font-mono text-vanilla-muted uppercase">Synthesized Intel</span>
            </div>
          </div>

          <span className="text-xs font-mono text-vanilla-muted">
            {insights.length} Vector Points
          </span>
        </div>

        {/* Insight Items */}
        <div className="space-y-2.5 my-4">
          {insights.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-brunswick/60 border-tangerine/50 shadow-[0_0_18px_rgba(235,125,0,0.12)]'
                    : 'bg-darkbrown/40 hover:bg-brunswick/30 border-vanilla/10'
                }`}
              >
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="p-1 rounded-lg bg-darkbrown/60 border border-vanilla/10">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-vanilla tracking-tight truncate">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-vanilla-muted mt-0.5">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span className="text-tangerine">{item.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getImpactBadge(item.impactLevel)}`}>
                      {item.impactLevel}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-vanilla-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-vanilla-muted" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-vanilla-soft leading-relaxed border-t border-vanilla/10 animate-in fade-in duration-200">
                    <p>{item.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-vanilla/10 flex items-center justify-between text-[11px] font-mono text-vanilla-muted">
        <span>Dynamic Bayesian Arbitration</span>
        <span className="text-tangerine">Confidence Threshold &gt; 85%</span>
      </div>

    </div>
  );
};
