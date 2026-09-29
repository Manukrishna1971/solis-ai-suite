import React from 'react';
import { X, History, Trash2, ArrowRight, Award, Clock } from 'lucide-react';
import { AnalysisResult } from '../types';
import { audioFX } from '../utils/audioFX';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => {
          audioFX.playClick();
          onClose();
        }}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-md h-full glass-surface border-l border-vanilla/20 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 bg-[#191609]/95">
        
        {/* Header */}
        <div className="p-5 border-b border-vanilla/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vanilla tracking-tight">Audit Archive</h3>
              <p className="text-[10px] font-mono text-vanilla-muted">{history.length} Saved Syntheses</p>
            </div>
          </div>

          <button
            onClick={() => {
              audioFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-vanilla-muted hover:text-vanilla hover:bg-brunswick/40 border border-transparent hover:border-vanilla/15 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-20 text-center text-vanilla-muted">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-tangerine" />
              <p className="text-xs">No previous intelligence audits recorded yet.</p>
              <p className="text-[10px] text-vanilla-muted/60 mt-1">Execute an audit to populate this vault.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  audioFX.playClick();
                  onSelectResult(item);
                  onClose();
                }}
                className="group p-4 rounded-2xl bg-brunswick/25 hover:bg-brunswick/50 border border-vanilla/10 hover:border-tangerine/50 transition-all cursor-pointer shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tangerine" />
                    <span className="text-[10px] font-mono text-vanilla-muted uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {item.compositeScore}/100
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-vanilla group-hover:text-white transition-colors truncate">
                  {item.title}
                </h4>

                <p className="text-[11px] text-vanilla-muted line-clamp-2 mt-1 leading-snug">
                  {item.summaryParagraph}
                </p>

                <div className="mt-3 pt-2 border-t border-vanilla/10 flex items-center justify-between text-[10px] font-mono text-vanilla-soft">
                  <span>{item.sentiment.overallTone}</span>
                  <span className="text-tangerine group-hover:translate-x-1 transition-transform flex items-center gap-1 font-sans">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-vanilla/10 bg-darkbrown/60 flex items-center justify-between">
            <span className="text-[11px] font-mono text-vanilla-muted">Local encrypted vault</span>
            <button
              onClick={() => {
                audioFX.playClick();
                onClearHistory();
              }}
              className="text-xs font-medium text-red-400/80 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Vault</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
