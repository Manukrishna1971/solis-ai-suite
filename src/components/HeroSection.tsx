import React from 'react';
import { Sparkles, ArrowRight, Zap, Target, Gauge, Scan, Layers, Eye, Video, ShieldCheck } from 'lucide-react';
import { PRESET_SCENARIOS } from '../utils/aiEngine';
import { audioFX } from '../utils/audioFX';

interface HeroSectionProps {
  activeMode: 'text' | 'vision' | 'webcam';
  onSelectPreset: (scenarioId: string) => void;
  activePresetId?: string;
  onSwitchMode?: (mode: 'text' | 'vision' | 'webcam') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeMode,
  onSelectPreset,
  activePresetId,
}) => {
  const getBadgeText = () => {
    switch (activeMode) {
      case 'text':
        return 'Autonomous Strategic Intelligence & Synthesis';
      case 'vision':
        return 'Neural Computer Vision & Spatial Object Detection';
      case 'webcam':
        return 'Continuous 60 FPS Real-Time Optical Tracking HUD';
    }
  };

  return (
    <section className="pt-28 pb-10 sm:pt-36 sm:pb-12 px-4 text-center max-w-5xl mx-auto relative z-10">
      
      {/* Top pill badge */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-brunswick/50 border border-vanilla/20 shadow-lg mb-6 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-tangerine shadow-[0_0_8px_#EB7D00] animate-pulse" />
        <span className="text-xs font-medium tracking-wider uppercase text-vanilla-soft">
          {getBadgeText()}
        </span>
        <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-vanilla/40" />
        <span className="hidden sm:inline-block text-xs font-mono text-tangerine">v4.5</span>
      </div>

      {/* Hero Headline in Vanilla */}
      {activeMode === 'text' && (
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-vanilla leading-[1.1] mb-6">
          Cognitive clarity for <br />
          <span className="bg-gradient-to-r from-vanilla via-[#FFF8D4] to-tangerine bg-clip-text text-transparent">
            high-stakes decisions.
          </span>
        </h1>
      )}

      {activeMode === 'vision' && (
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-vanilla leading-[1.1] mb-6">
          Neural object detection for <br />
          <span className="bg-gradient-to-r from-vanilla via-[#FFF8D4] to-tangerine bg-clip-text text-transparent">
            autonomous perception.
          </span>
        </h1>
      )}

      {activeMode === 'webcam' && (
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-vanilla leading-[1.1] mb-6">
          Real-time optical recognition for <br />
          <span className="bg-gradient-to-r from-vanilla via-[#FFF8D4] to-tangerine bg-clip-text text-transparent">
            live camera streams.
          </span>
        </h1>
      )}

      {/* Subtitle */}
      <p className="text-base sm:text-xl text-vanilla-soft max-w-2xl mx-auto leading-relaxed font-sans font-light mb-8">
        {activeMode === 'text' && (
          'Instantly analyze critical memos, board presentations, customer escalations, and strategic roadmaps. Extract multi-dimensional sentiment, actionable levers, and institutional ratings.'
        )}
        {activeMode === 'vision' && (
          'Upload any raster image or evaluate high-fidelity benchmark scenes. Detect objects, classify taxonomies, render neon HUD targeting reticles, and extract precision spatial coordinates.'
        )}
        {activeMode === 'webcam' && (
          'Connect your camera to activate continuous 60 FPS object & personnel tracking with neon Tangerine crosshairs, live coordinate streaming, and one-click deep audit capture.'
        )}
      </p>

      {/* Quick live telemetry badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-10 text-left">
        <div className="glass-surface rounded-xl p-3 flex items-center gap-3 border border-vanilla/10">
          <div className="w-8 h-8 rounded-lg bg-tangerine/15 text-tangerine flex items-center justify-center">
            {activeMode === 'webcam' ? <Video className="w-4 h-4 text-red-400" /> : activeMode === 'text' ? <Zap className="w-4 h-4" /> : <Scan className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-vanilla-muted">
              {activeMode === 'webcam' ? 'Stream Rate' : activeMode === 'text' ? 'Inference' : 'Optical Core'}
            </div>
            <div className="text-xs font-semibold text-vanilla">
              {activeMode === 'webcam' ? '60 FPS Continuous' : activeMode === 'text' ? 'Sub-12ms Latency' : 'Sub-pixel HUD'}
            </div>
          </div>
        </div>

        <div className="glass-surface rounded-xl p-3 flex items-center gap-3 border border-vanilla/10">
          <div className="w-8 h-8 rounded-lg bg-brunswick/50 text-vanilla flex items-center justify-center">
            {activeMode === 'webcam' ? <Target className="w-4 h-4 text-tangerine" /> : activeMode === 'text' ? <Gauge className="w-4 h-4" /> : <Layers className="w-4 h-4 text-tangerine" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-vanilla-muted">
              {activeMode === 'webcam' ? 'Lock Engine' : activeMode === 'text' ? 'Precision' : 'Taxonomies'}
            </div>
            <div className="text-xs font-semibold text-vanilla">
              {activeMode === 'webcam' ? 'Active Reticles' : activeMode === 'text' ? '99.4% Multi-tone' : '5 Core Classes'}
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 glass-surface rounded-xl p-3 flex items-center gap-3 border border-vanilla/10">
          <div className="w-8 h-8 rounded-lg bg-tangerine/15 text-tangerine flex items-center justify-center">
            {activeMode === 'webcam' ? <ShieldCheck className="w-4 h-4 text-tangerine" /> : activeMode === 'text' ? <Target className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-vanilla-muted">
              {activeMode === 'webcam' ? 'Privacy' : activeMode === 'text' ? 'Output' : 'Tracking'}
            </div>
            <div className="text-xs font-semibold text-vanilla">
              {activeMode === 'webcam' ? 'Zero Off-premise' : activeMode === 'text' ? 'Actionable Rewrites' : 'Spatial Reticles'}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario launcher bar (Only in text mode) */}
      {activeMode === 'text' && (
        <div className="pt-2">
          <div className="text-xs font-mono tracking-widest text-vanilla-muted uppercase mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-tangerine" />
            <span>Or load executive benchmark scenarios</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {PRESET_SCENARIOS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    audioFX.playClick();
                    onSelectPreset(preset.id);
                  }}
                  onMouseEnter={() => audioFX.playHover()}
                  className={`group px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-tangerine/20 border-tangerine text-white shadow-[0_0_16px_rgba(235,125,0,0.35)] scale-105'
                      : 'bg-brunswick/40 hover:bg-brunswick/60 border-vanilla/15 text-vanilla-soft hover:text-vanilla hover:border-vanilla/30'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-tangerine text-darkbrown-deep font-bold' : 'bg-darkbrown/60 text-vanilla-muted'
                  }`}>
                    {preset.category}
                  </span>
                  <ArrowRight className="w-3 h-3 text-tangerine opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      )}

    </section>
  );
};
