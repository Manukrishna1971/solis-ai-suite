import React, { useState } from 'react';
import { Share2, Download, Copy, Check, Clock, Cpu, Sparkles, RefreshCcw, Layers } from 'lucide-react';
import { AnalysisResult } from '../types';
import { ScoreCard } from './cards/ScoreCard';
import { SentimentCard } from './cards/SentimentCard';
import { KeyInsightsCard } from './cards/KeyInsightsCard';
import { SuggestionsCard } from './cards/SuggestionsCard';
import { audioFX } from '../utils/audioFX';

interface DashboardViewProps {
  result: AnalysisResult;
  onReset: () => void;
  onOpenExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  result,
  onReset,
  onOpenExport,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = () => {
    audioFX.playClick();
    const summaryText = `[SOLIS AI COGNITIVE AUDIT]\nTitle: ${result.title}\nComposite Score: ${result.compositeScore}/100 (${result.tierGrade})\nOverall Tone: ${result.sentiment.overallTone}\nSummary: ${result.summaryHeadline}\n${result.summaryParagraph}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 relative z-20 animate-in fade-in duration-500">
      
      {/* Executive Overview Header Banner */}
      <div className="glass-surface rounded-3xl p-6 sm:p-8 mb-8 border border-vanilla/20 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-tangerine/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Headline & Metadata */}
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-tangerine/20 border border-tangerine/40 text-tangerine font-mono text-[11px] font-bold">
                AUDIT COMPLETED
              </span>
              <span className="text-xs font-mono text-vanilla-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{result.timestamp}</span>
              </span>
              <span className="text-vanilla-muted">•</span>
              <span className="text-xs font-mono text-vanilla-muted flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-tangerine" />
                <span>{result.processingTimeMs}ms inference</span>
              </span>
              <span className="text-vanilla-muted">•</span>
              <span className="text-xs font-mono text-vanilla-muted">
                {result.tokensProcessed} tokens analyzed
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-vanilla tracking-tight leading-snug">
              {result.title}
            </h2>

            <p className="text-sm sm:text-base text-vanilla-soft mt-2 leading-relaxed">
              {result.summaryParagraph}
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start lg:self-center">
            
            <button
              onClick={handleCopySummary}
              onMouseEnter={() => audioFX.playHover()}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-vanilla-soft hover:text-vanilla bg-brunswick/50 hover:bg-brunswick/70 border border-vanilla/15 transition-all flex items-center gap-2"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-tangerine" />
                  <span className="text-tangerine font-semibold">Summary Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-tangerine" />
                  <span>Copy Brief</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                audioFX.playClick();
                onOpenExport();
              }}
              onMouseEnter={() => audioFX.playHover()}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-vanilla-soft hover:text-vanilla bg-brunswick/50 hover:bg-brunswick/70 border border-vanilla/15 transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-tangerine" />
              <span>Export Dossier</span>
            </button>

            <button
              onClick={() => {
                audioFX.playClick();
                onReset();
              }}
              onMouseEnter={() => audioFX.playHover()}
              className="btn-tangerine-glow px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-tangerine-sm"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>New Input</span>
            </button>

          </div>

        </div>

      </div>

      {/* 2x2 Interactive Luxury Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <ScoreCard result={result} />
        <SentimentCard sentiment={result.sentiment} />
        <KeyInsightsCard insights={result.insights} />
        <SuggestionsCard suggestions={result.suggestions} />
      </div>

      {/* Bottom Bar Details */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl glass-surface border border-vanilla/15 text-xs font-mono text-vanilla-muted">
          <Layers className="w-3.5 h-3.5 text-tangerine" />
          <span>Solis Multi-agent Consensus Model • Output Hash: #{result.id.slice(-8)}</span>
          <span className="text-tangerine font-semibold">100% Cryptographic Audit Trail</span>
        </div>
      </div>

    </section>
  );
};
