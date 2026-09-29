import React from 'react';
import { Activity, Flame, MessageSquare, Tag } from 'lucide-react';
import { SentimentBreakdown } from '../../types';
import { useTilt } from '../../hooks/useTilt';
import { audioFX } from '../../utils/audioFX';

interface SentimentCardProps {
  sentiment: SentimentBreakdown;
}

export const SentimentCard: React.FC<SentimentCardProps> = ({ sentiment }) => {
  const { ref, cardStyle, glareStyle, onMouseMove, onMouseLeave } = useTilt(8);

  const getToneBadgeStyle = (tone: string) => {
    if (tone.includes('Urgent')) return 'bg-tangerine/20 border-tangerine text-tangerine';
    if (tone.includes('Optimistic')) return 'bg-brunswick/50 border-vanilla/30 text-vanilla';
    return 'bg-darkbrown/60 border-vanilla/20 text-vanilla-soft';
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
            <div className="w-8 h-8 rounded-xl bg-brunswick/40 text-vanilla border border-vanilla/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-tangerine" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-vanilla tracking-tight">Sentiment Telemetry</h4>
              <span className="text-[10px] font-mono text-vanilla-muted uppercase">Affective Computing</span>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide flex items-center gap-1 shadow-sm ${getToneBadgeStyle(sentiment.overallTone)}`}>
            <MessageSquare className="w-3 h-3 text-tangerine" />
            <span>{sentiment.overallTone}</span>
          </div>
        </div>

        {/* 4-Vector Sentiment Distribution */}
        <div className="space-y-3 my-5">
          {/* Positive */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-vanilla font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tangerine" />
                <span>Conviction & Optimism</span>
              </span>
              <span className="font-mono text-tangerine font-bold">{sentiment.positive}%</span>
            </div>
            <div className="w-full bg-darkbrown rounded-full h-2 overflow-hidden border border-vanilla/10">
              <div 
                className="bg-tangerine h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_#EB7D00]"
                style={{ width: `${sentiment.positive}%` }}
              />
            </div>
          </div>

          {/* Constructive / Strategic */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-vanilla font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brunswick-light" />
                <span>Constructive & Strategic</span>
              </span>
              <span className="font-mono text-vanilla font-bold">{sentiment.constructive}%</span>
            </div>
            <div className="w-full bg-darkbrown rounded-full h-2 overflow-hidden border border-vanilla/10">
              <div 
                className="bg-brunswick-light h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${sentiment.constructive}%` }}
              />
            </div>
          </div>

          {/* Neutral / Analytical */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-vanilla font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-vanilla/60" />
                <span>Objective & Analytical</span>
              </span>
              <span className="font-mono text-vanilla-soft font-bold">{sentiment.neutral}%</span>
            </div>
            <div className="w-full bg-darkbrown rounded-full h-2 overflow-hidden border border-vanilla/10">
              <div 
                className="bg-vanilla/50 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${sentiment.neutral}%` }}
              />
            </div>
          </div>

          {/* Urgent / Risk */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-vanilla font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>Urgency & Escalation</span>
              </span>
              <span className="font-mono text-amber-500 font-bold">{sentiment.urgent}%</span>
            </div>
            <div className="w-full bg-darkbrown rounded-full h-2 overflow-hidden border border-vanilla/10">
              <div 
                className="bg-amber-600 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${sentiment.urgent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Emotional Temperature Meter */}
        <div className="p-3.5 rounded-2xl bg-darkbrown/60 border border-vanilla/10 my-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-vanilla-soft flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-tangerine" />
              <span>Emotional Velocity</span>
            </span>
            <span className="font-mono text-xs text-tangerine font-bold">
              {sentiment.emotionalTemperature}° C
            </span>
          </div>

          <div className="relative w-full h-2 bg-gradient-to-r from-brunswick via-vanilla/30 to-tangerine rounded-full overflow-hidden">
            <div 
              className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-[0_0_8px_#EB7D00] border border-tangerine transition-all duration-700 ease-out transform -translate-x-1/2"
              style={{ left: `${sentiment.emotionalTemperature}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-vanilla-muted mt-1.5">
            <span>Methodical</span>
            <span>Measured</span>
            <span>High Intensity</span>
          </div>
        </div>
      </div>

      {/* Dominant Keywords Tags */}
      <div className="pt-3 border-t border-vanilla/10">
        <div className="text-[10px] font-mono uppercase text-vanilla-muted mb-2 flex items-center gap-1">
          <Tag className="w-3 h-3 text-tangerine" />
          <span>Extracted Cognitive Anchors</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sentiment.dominantKeywords.map((item, i) => (
            <span 
              key={i}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-brunswick/40 border border-vanilla/15 text-vanilla hover:border-tangerine/50 transition-colors"
            >
              {item.word}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
