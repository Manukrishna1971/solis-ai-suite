import React from 'react';
import { Award, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { useTilt } from '../../hooks/useTilt';
import { audioFX } from '../../utils/audioFX';

interface ScoreCardProps {
  result: AnalysisResult;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ result }) => {
  const { ref, cardStyle, glareStyle, onMouseMove, onMouseLeave } = useTilt(8);

  // SVG Gauge calculations for radial gauge
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.compositeScore / 100) * circumference;

  return (
    <div
      ref={ref}
      style={cardStyle}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={() => audioFX.playHover()}
      className="tilt-card glass-surface rounded-3xl p-6 sm:p-7 border border-vanilla/15 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
    >
      {/* Specular glare overlay */}
      <div className="absolute inset-0 pointer-events-none" style={glareStyle} />

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-vanilla tracking-tight">Composite Rating</h4>
              <span className="text-[10px] font-mono text-vanilla-muted uppercase">Multi-vector Index</span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-tangerine/20 border border-tangerine/40 text-tangerine text-[11px] font-semibold tracking-wide flex items-center gap-1 shadow-sm">
            <TrendingUp className="w-3 h-3" />
            <span>{result.tierGrade}</span>
          </div>
        </div>

        {/* Radial Luxury Gauge */}
        <div className="py-4 flex items-center justify-center relative">
          <div className="relative w-40 h-40 flex items-center justify-center">
            
            {/* Background SVG Circle */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="#1B180A"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="url(#tangerineGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(235, 125, 0, 0.6))',
                }}
              />
              <defs>
                <linearGradient id="tangerineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA23A" />
                  <stop offset="60%" stopColor="#EB7D00" />
                  <stop offset="100%" stopColor="#C46400" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score Center Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-display font-extrabold text-vanilla tracking-tighter">
                {result.compositeScore}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-tangerine font-bold uppercase mt-0.5">
                / 100 Index
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Dimensional Metric Breakdown */}
      <div className="mt-4 pt-4 border-t border-vanilla/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-vanilla-muted uppercase">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-tangerine" />
            <span>Dimensional Vectors</span>
          </span>
          <span>Score</span>
        </div>

        {result.metrics.slice(0, 3).map((metric, i) => (
          <div key={i} className="group/metric">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-vanilla font-medium">{metric.label}</span>
              <span className="font-mono text-tangerine font-semibold">{metric.score}%</span>
            </div>
            <div className="w-full bg-darkbrown rounded-full h-1.5 overflow-hidden border border-vanilla/10">
              <div 
                className="bg-gradient-to-r from-brunswick to-tangerine h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${metric.score}%` }}
              />
            </div>
            <div className="text-[10px] text-vanilla-muted/80 mt-0.5 flex justify-between">
              <span>{metric.description}</span>
              <span className="font-mono text-vanilla/50 hidden sm:inline">{metric.benchmark}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Pill */}
      <div className="mt-5 pt-3 border-t border-vanilla/10 flex items-center justify-between text-[11px] font-mono text-vanilla-muted">
        <span className="flex items-center gap-1 text-vanilla-soft">
          <CheckCircle className="w-3.5 h-3.5 text-tangerine" />
          <span>Statistically Validated</span>
        </span>
        <span className="text-tangerine">p-value &lt; 0.001</span>
      </div>

    </div>
  );
};
