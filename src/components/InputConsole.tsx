import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Sparkles, Send, RefreshCw, Paperclip } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

interface InputConsoleProps {
  text: string;
  onChangeText: (text: string) => void;
  onAnalyze: (sourceType: 'text' | 'file' | 'preset') => void;
  isProcessing: boolean;
  onClear: () => void;
}

export const InputConsole: React.FC<InputConsoleProps> = ({
  text,
  onChangeText,
  onAnalyze,
  isProcessing,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;
  const estimatedTokens = Math.round(wordsCount * 1.35);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    audioFX.playClick();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      audioFX.playClick();
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChangeText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setFileName(null);
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (text.trim() && !isProcessing) {
        onAnalyze(fileName ? 'file' : 'text');
      }
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 pb-14 relative z-20">
      
      {/* Console Frame */}
      <div 
        className={`glass-surface rounded-2xl transition-all duration-300 relative overflow-hidden ${
          isFocused 
            ? 'border-tangerine/60 shadow-[0_0_35px_rgba(235,125,0,0.22)]' 
            : 'border-vanilla/15 shadow-2xl'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
      >
        
        {/* Subtle Top status bar inside console */}
        <div className="px-5 py-3 border-b border-vanilla/10 flex items-center justify-between text-xs font-mono bg-darkbrown/40">
          <div className="flex items-center gap-2 text-vanilla-muted">
            <span className="w-2 h-2 rounded-full bg-tangerine inline-block" />
            <span className="text-vanilla font-medium">NEURAL INGESTION INTERFACE</span>
            {fileName && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brunswick/70 text-vanilla border border-vanilla/20">
                <FileText className="w-3 h-3 text-tangerine" />
                <span className="truncate max-w-[180px]">{fileName}</span>
                <button 
                  onClick={handleRemoveFile} 
                  className="hover:text-tangerine transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-vanilla-muted">
            <span>{wordsCount} words</span>
            <span>•</span>
            <span className="text-tangerine font-semibold">~{estimatedTokens} tokens</span>
            <span>•</span>
            <span className="hidden sm:inline">⌘ + Enter to execute</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-5 sm:p-6 relative">
          <textarea
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste any executive memo, crisis escalation, strategic pitch, board briefing, or drop a document file to synthesize..."
            rows={7}
            className="w-full bg-transparent text-vanilla placeholder-vanilla-muted/60 text-sm sm:text-base leading-relaxed resize-none focus:outline-none font-sans"
          />

          {/* Drag Overlay if dragging */}
          {isDragging && (
            <div className="absolute inset-0 bg-brunswick/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-tangerine z-30 transition-all">
              <UploadCloud className="w-12 h-12 text-tangerine mb-3 animate-bounce" />
              <div className="text-vanilla font-semibold text-lg">Drop your document here</div>
              <div className="text-xs text-vanilla-muted mt-1">Solis AI will ingest and extract semantic tokens</div>
            </div>
          )}
        </div>

        {/* Bottom Actions and Controls */}
        <div className="px-5 py-4 bg-darkbrown/60 border-t border-vanilla/10 flex flex-wrap items-center justify-between gap-3">
          
          {/* File Upload Trigger */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt,.md,.json,.csv,.doc,.docx"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => {
                audioFX.playClick();
                fileInputRef.current?.click();
              }}
              onMouseEnter={() => audioFX.playHover()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-vanilla-soft hover:text-vanilla bg-brunswick/40 hover:bg-brunswick/60 border border-vanilla/15 transition-all"
            >
              <Paperclip className="w-3.5 h-3.5 text-tangerine" />
              <span>Attach File</span>
            </button>

            {text && (
              <button
                type="button"
                onClick={() => {
                  audioFX.playClick();
                  handleRemoveFile();
                }}
                onMouseEnter={() => audioFX.playHover()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-vanilla-muted hover:text-vanilla hover:bg-brunswick/30 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Primary CTA: Synthesize Intelligence Button */}
          <button
            type="button"
            disabled={!text.trim() || isProcessing}
            onClick={() => {
              audioFX.playClick();
              onAnalyze(fileName ? 'file' : 'text');
            }}
            onMouseEnter={() => audioFX.playHover()}
            className={`btn-tangerine-glow px-6 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2.5 transition-all duration-200 ${
              !text.trim() || isProcessing ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:scale-[1.03]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Vectors...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Initiate AI Synthesis</span>
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>

        </div>

      </div>

      {/* Under-console hint */}
      <div className="flex items-center justify-between text-[11px] font-mono text-vanilla-muted/80 px-2 mt-2.5">
        <div>Proprietary zero-retention analysis runtime</div>
        <div>SOC2 Type II • ISO 27001 • ITAR Ready</div>
      </div>

    </section>
  );
};
