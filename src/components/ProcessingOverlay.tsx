import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ProcessingOverlayProps {
  onComplete: () => void;
}

const PHASES = [
  { id: 1, name: 'Neural Ingestion & Token Parsing', detail: 'Tokenizing semantic structures & lexical density' },
  { id: 2, name: 'Brunswick-Vector Tone Convergence', detail: 'Isolating emotional variance, confidence, and urgency cues' },
  { id: 3, name: 'Strategic Vulnerability & Alpha Mapping', detail: 'Correlating risk matrices with market defensibility heuristics' },
  { id: 4, name: 'Synthesis & Executive Rating Compilation', detail: 'Synthesizing actionable rewrites and final composite rating' },
];

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(15);
  const [telemetryMessage, setTelemetryMessage] = useState('Initializing Solis Tensor Engine...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentPhase(1);
      setProgress(40);
      setTelemetryMessage('Extracting sentiment polarity across 4 emotional axes...');
    }, 450);

    const timer2 = setTimeout(() => {
      setCurrentPhase(2);
      setProgress(72);
      setTelemetryMessage('Synthesizing strategic advantages & latent risk exposures...');
    }, 950);

    const timer3 = setTimeout(() => {
      setCurrentPhase(3);
      setProgress(95);
      setTelemetryMessage('Assembling executive radar metrics and actionable rewrites...');
    }, 1450);

    const timer4 = setTimeout(() => {
      setProgress(100);
      onComplete();
    }, 1850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 relative z-30 animate-in fade-in zoom-in-95 duration-200">
      <div className="glass-surface rounded-3xl p-8 sm:p-10 border border-tangerine/40 shadow-[0_0_60px_rgba(235,125,0,0.2)] text-center relative overflow-hidden">
        
        {/* Shimmer light beam at top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-tangerine to-transparent opacity-80" />

        {/* Central glowing futuristic orb loader */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-tangerine/30 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-tangerine animate-spin-slow" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brunswick to-darkbrown border border-vanilla/40 flex items-center justify-center shadow-[0_0_30px_#EB7D00]">
            <Cpu className="w-8 h-8 text-tangerine animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-display font-bold text-vanilla mb-2 tracking-tight">
          Solis Cognitive Synthesis in Progress
        </h3>
        <p className="text-xs font-mono text-tangerine uppercase tracking-widest mb-6">
          {telemetryMessage}
        </p>

        {/* Shimmer progress bar */}
        <div className="w-full bg-darkbrown rounded-full h-2.5 mb-8 overflow-hidden border border-vanilla/15 p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-tangerine-dark via-tangerine to-vanilla transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer-wave" />
          </div>
        </div>

        {/* Phase checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {PHASES.map((phase, idx) => {
            const isDone = idx < currentPhase;
            const isCurrent = idx === currentPhase;

            return (
              <div 
                key={phase.id}
                className={`p-3 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                  isDone 
                    ? 'bg-brunswick/50 border-vanilla/20 text-vanilla'
                    : isCurrent
                    ? 'bg-tangerine/15 border-tangerine/60 text-white shadow-[0_0_15px_rgba(235,125,0,0.2)]'
                    : 'bg-darkbrown/30 border-vanilla/5 text-vanilla-muted/60 opacity-60'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-tangerine" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-tangerine animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-vanilla/20 flex items-center justify-center text-[9px] font-mono">
                      {phase.id}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-semibold tracking-tight truncate">
                    {phase.name}
                  </div>
                  <div className="text-[10px] text-vanilla-muted leading-tight mt-0.5">
                    {phase.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom subtle assurance */}
        <div className="mt-8 pt-4 border-t border-vanilla/10 flex items-center justify-center gap-2 text-[11px] font-mono text-vanilla-muted">
          <Sparkles className="w-3.5 h-3.5 text-tangerine" />
          <span>Executing zero-egress quantum-quantized inference</span>
        </div>

      </div>
    </div>
  );
};
