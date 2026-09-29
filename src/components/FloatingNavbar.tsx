import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, History, Cpu, FileText, Scan, Video } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

interface FloatingNavbarProps {
  activeMode: 'text' | 'vision' | 'webcam';
  onSelectMode: (mode: 'text' | 'vision' | 'webcam') => void;
  onOpenHistory: () => void;
  historyCount: number;
  onReset: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  activeMode,
  onSelectMode,
  onOpenHistory,
  historyCount,
  onReset,
  selectedModel,
  onSelectModel,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(audioFX.isEnabled());
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const getModels = () => {
    switch (activeMode) {
      case 'text':
        return [
          { id: 'titan', name: 'Solis Titan 4.5', desc: 'Deep Multi-vector Synthesis' },
          { id: 'apex', name: 'Solis Apex Quantum', desc: 'Ultra-low Latency Inference' },
          { id: 'governance', name: 'Solis Sovereign 2.0', desc: 'Enterprise Risk & Compliance' },
        ];
      case 'vision':
        return [
          { id: 'vision-x', name: 'Solis Vision-X Optical', desc: 'YOLOv9 Spatial Localization' },
          { id: 'panoptic', name: 'Solis Panoptic Pro', desc: 'Segment-Anything Foundation Core' },
          { id: 'hyper-res', name: 'Solis Sub-Pixel 4K', desc: 'Extreme Resolution Telemetry' },
        ];
      case 'webcam':
        return [
          { id: 'stream-60', name: 'Solis Real-Time Stream Core', desc: '60 FPS Continuous Vector Tracking' },
          { id: 'biometric', name: 'Solis Biometric Anchor', desc: 'Facial Landmark & Identity Beacon' },
          { id: 'edge-cuda', name: 'Solis Edge CUDA Runtime', desc: 'Zero-Egress Local Hardware Pipeline' },
        ];
    }
  };

  const models = getModels();

  const handleToggleAudio = () => {
    const newState = audioFX.toggle();
    setAudioEnabled(newState);
  };

  return (
    <header className="fixed top-5 inset-x-0 z-40 max-w-7xl mx-auto px-4 sm:px-6">
      <nav className="glass-surface rounded-2xl px-4 py-3 sm:px-6 sm:py-3 flex items-center justify-between shadow-2xl transition-all duration-300 border border-vanilla/15">
        
        {/* Brand identity */}
        <div 
          onClick={() => { audioFX.playClick(); onReset(); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brunswick to-darkbrown border border-vanilla/30 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-tangerine transition-colors">
            {/* Tangerine core pulse */}
            <div className="absolute inset-0 bg-tangerine/20 rounded-xl blur-xs group-hover:bg-tangerine/30 transition-all" />
            <div className="w-3.5 h-3.5 bg-tangerine rounded-md rotate-45 shadow-[0_0_12px_#EB7D00] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-90" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold tracking-wider text-base text-vanilla group-hover:text-white transition-colors">
                SOLIS
              </span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-tangerine/15 text-tangerine border border-tangerine/30 font-semibold">
                AI
              </span>
            </div>
            <p className="text-[10px] text-vanilla-muted tracking-tight hidden lg:block">
              Autonomous Luxury Intelligence
            </p>
          </div>
        </div>

        {/* Center: 3-Way Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-darkbrown/85 border border-vanilla/15 shadow-inner">
          <button
            onClick={() => {
              if (activeMode !== 'text') {
                audioFX.playClick();
                onSelectMode('text');
              }
            }}
            onMouseEnter={() => audioFX.playHover()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'text'
                ? 'bg-tangerine text-darkbrown-deep font-bold shadow-md'
                : 'text-vanilla-muted hover:text-vanilla hover:bg-brunswick/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Text</span>
          </button>

          <button
            onClick={() => {
              if (activeMode !== 'vision') {
                audioFX.playClick();
                onSelectMode('vision');
              }
            }}
            onMouseEnter={() => audioFX.playHover()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'vision'
                ? 'bg-tangerine text-darkbrown-deep font-bold shadow-md'
                : 'text-vanilla-muted hover:text-vanilla hover:bg-brunswick/40'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vision</span>
          </button>

          <button
            onClick={() => {
              if (activeMode !== 'webcam') {
                audioFX.playClick();
                onSelectMode('webcam');
              }
            }}
            onMouseEnter={() => audioFX.playHover()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'webcam'
                ? 'bg-tangerine text-darkbrown-deep font-bold shadow-md'
                : 'text-vanilla-muted hover:text-vanilla hover:bg-brunswick/40'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Live Webcam</span>
            <span className="sm:hidden">Cam</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Model Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => {
                audioFX.playClick();
                setModelDropdownOpen(!modelDropdownOpen);
              }}
              onMouseEnter={() => audioFX.playHover()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-vanilla-soft hover:text-vanilla bg-brunswick/30 hover:bg-brunswick/50 border border-vanilla/15 transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-tangerine" />
              <span className="hidden md:inline">Core</span>
            </button>

            {modelDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 glass-surface rounded-xl p-2 shadow-2xl border border-vanilla/20 z-50 animate-in fade-in zoom-in-95 duration-150 bg-[#161409]/95"
                onMouseLeave={() => setModelDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-vanilla-muted">
                  Active Intelligence Core
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      audioFX.playClick();
                      onSelectModel(m.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                      selectedModel.includes(m.name)
                        ? 'bg-tangerine/15 text-vanilla border border-tangerine/30'
                        : 'text-vanilla-soft hover:bg-brunswick/40 hover:text-vanilla'
                    }`}
                  >
                    <span className="font-semibold flex items-center justify-between">
                      {m.name}
                      {selectedModel.includes(m.name) && (
                        <span className="text-[10px] text-tangerine font-mono">ACTIVE</span>
                      )}
                    </span>
                    <span className="text-[10px] text-vanilla-muted mt-0.5">{m.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio toggle button */}
          <button
            onClick={handleToggleAudio}
            onMouseEnter={() => audioFX.playHover()}
            title={audioEnabled ? 'Mute luxury sound effects' : 'Enable luxury sound effects'}
            className="p-2 rounded-lg text-xs text-vanilla-soft hover:text-vanilla bg-brunswick/30 hover:bg-brunswick/50 border border-vanilla/15 transition-all"
          >
            {audioEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-tangerine" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-vanilla-muted" />
            )}
          </button>

          {/* History drawer button (for text audits) */}
          {activeMode === 'text' && (
            <button
              onClick={() => {
                audioFX.playClick();
                onOpenHistory();
              }}
              onMouseEnter={() => audioFX.playHover()}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-vanilla-soft hover:text-vanilla bg-brunswick/30 hover:bg-brunswick/50 border border-vanilla/15 transition-all"
            >
              <History className="w-3.5 h-3.5 text-vanilla-muted" />
              <span>Archive</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-tangerine text-darkbrown-deep font-bold text-[10px] ml-0.5">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* Quick New Run Button */}
          <button
            onClick={() => {
              audioFX.playClick();
              onReset();
            }}
            onMouseEnter={() => audioFX.playHover()}
            className="btn-tangerine-glow px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-tangerine-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wide hidden sm:inline">Reset</span>
          </button>

        </div>
      </nav>
    </header>
  );
};
