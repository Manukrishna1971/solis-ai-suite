import React, { useState } from 'react';
import { 
  Scan, 
  Layers, 
  Download, 
  Copy, 
  Check, 
  RefreshCcw, 
  Clock, 
  Cpu, 
  Target, 
  ShieldCheck, 
  AlertCircle, 
  Compass, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { VisionAnalysisResult, DetectedObject } from '../../types';
import { VisionCanvas } from './VisionCanvas';
import { useTilt } from '../../hooks/useTilt';
import { audioFX } from '../../utils/audioFX';

interface VisionDashboardProps {
  result: VisionAnalysisResult;
  onReset: () => void;
  isScanning?: boolean;
}

export const VisionDashboard: React.FC<VisionDashboardProps> = ({
  result,
  onReset,
  isScanning = false,
}) => {
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [copiedTelemetry, setCopiedTelemetry] = useState(false);

  const { ref: scoreRef, cardStyle: scoreStyle, glareStyle: scoreGlare, onMouseMove: scoreMove, onMouseLeave: scoreLeave } = useTilt(6);
  const { ref: ledgerRef, cardStyle: ledgerStyle, glareStyle: ledgerGlare, onMouseMove: ledgerMove, onMouseLeave: ledgerLeave } = useTilt(6);

  const filteredObjects = filterCategory === 'ALL'
    ? result.objects
    : result.objects.filter(o => o.category === filterCategory);

  const handleCopyTelemetry = () => {
    audioFX.playClick();
    const payload = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(payload);
    setCopiedTelemetry(true);
    setTimeout(() => setCopiedTelemetry(false), 2000);
  };

  const handleDownloadJSON = () => {
    audioFX.playClick();
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Solis_Vision_${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // SVG Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.opticalIntegrityScore / 100) * circumference;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 relative z-20 animate-in fade-in duration-500">
      
      {/* Top Vision Executive Banner */}
      <div className="glass-surface rounded-3xl p-6 sm:p-8 mb-8 border border-vanilla/20 shadow-2xl relative overflow-hidden">
        
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-tangerine/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-tangerine/20 border border-tangerine/40 text-tangerine font-mono text-[11px] font-bold flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5" />
                <span>OPTICAL DECONSTRUCTION COMPLETE</span>
              </span>
              <span className="text-xs font-mono text-vanilla-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{result.timestamp}</span>
              </span>
              <span className="text-vanilla-muted">•</span>
              <span className="text-xs font-mono text-vanilla-muted flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-tangerine" />
                <span>{result.processingTimeMs}ms latency</span>
              </span>
              <span className="text-vanilla-muted">•</span>
              <span className="text-xs font-mono text-tangerine font-semibold">
                {result.totalObjects} Identified Targets
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-vanilla tracking-tight">
              {result.overallSceneClassification}
            </h2>

            <p className="text-sm text-vanilla-soft mt-2 leading-relaxed">
              {result.sceneSummary}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleCopyTelemetry}
              onMouseEnter={() => audioFX.playHover()}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-vanilla-soft hover:text-vanilla bg-brunswick/50 hover:bg-brunswick/70 border border-vanilla/15 transition-all flex items-center gap-2"
            >
              {copiedTelemetry ? (
                <>
                  <Check className="w-3.5 h-3.5 text-tangerine" />
                  <span className="text-tangerine font-semibold">Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-tangerine" />
                  <span>Copy Telemetry</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadJSON}
              onMouseEnter={() => audioFX.playHover()}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-vanilla-soft hover:text-vanilla bg-brunswick/50 hover:bg-brunswick/70 border border-vanilla/15 transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-tangerine" />
              <span>Export Coordinates</span>
            </button>

            <button
              onClick={() => {
                audioFX.playClick();
                onReset();
              }}
              onMouseEnter={() => audioFX.playHover()}
              className="btn-tangerine-glow px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-tangerine-sm"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>New Target Scan</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Grid: Interactive Canvas on Left, Detected Objects Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Canvas & Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Canvas Card */}
          <VisionCanvas
            imageSrc={result.imageSrc}
            imageName={result.imageName}
            objects={result.objects}
            selectedObjectId={selectedObject?.id}
            onSelectObject={setSelectedObject}
            isScanning={isScanning}
          />

          {/* Selected Object Deep Inspection Box */}
          {selectedObject ? (
            <div className="glass-surface rounded-2xl p-5 border border-tangerine/50 shadow-[0_0_30px_rgba(235,125,0,0.15)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-vanilla/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-tangerine animate-ping" />
                  <h4 className="text-sm font-semibold text-vanilla tracking-tight">
                    {selectedObject.label}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-darkbrown text-tangerine border border-tangerine/30">
                    {selectedObject.category}
                  </span>
                </div>

                <span className="text-xs font-mono text-tangerine font-bold">
                  {selectedObject.confidence}% Certainty
                </span>
              </div>

              <p className="text-xs text-vanilla-soft leading-relaxed mb-3">
                {selectedObject.description}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-darkbrown/60 border border-vanilla/10">
                  <span className="text-vanilla-muted block">BOUNDING COORD</span>
                  <span className="text-vanilla font-bold">X:{selectedObject.bbox.x}% Y:{selectedObject.bbox.y}%</span>
                </div>
                <div className="p-2 rounded-xl bg-darkbrown/60 border border-vanilla/10">
                  <span className="text-vanilla-muted block">SPATIAL SPAN</span>
                  <span className="text-vanilla font-bold">W:{selectedObject.bbox.width}% H:{selectedObject.bbox.height}%</span>
                </div>
                <div className="p-2 rounded-xl bg-darkbrown/60 border border-vanilla/10">
                  <span className="text-vanilla-muted block">STATUS</span>
                  <span className="text-tangerine font-bold uppercase">{selectedObject.threatLevel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-brunswick/20 border border-vanilla/10 text-center text-xs font-mono text-vanilla-muted">
              Select or hover any object above to activate spatial radar inspection
            </div>
          )}

          {/* Category Distribution Grid */}
          <div className="glass-surface rounded-2xl p-5 border border-vanilla/15 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-vanilla-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-tangerine" />
                <span>Class Distribution Spectrum</span>
              </span>
              <span className="text-xs font-mono text-tangerine font-bold">
                {result.categories.length} Distinct Taxonomies
              </span>
            </div>

            <div className="space-y-3">
              {result.categories.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-vanilla font-medium">{cat.category}</span>
                    <span className="font-mono text-vanilla-soft">
                      {cat.count} units ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-darkbrown rounded-full h-1.5 overflow-hidden border border-vanilla/10">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                        boxShadow: `0 0 8px ${cat.color}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Detected Objects Ledger & Scene Integrity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Scene Integrity Gauge Card */}
          <div
            ref={scoreRef}
            style={scoreStyle}
            onMouseMove={scoreMove}
            onMouseLeave={scoreLeave}
            className="tilt-card glass-surface rounded-3xl p-6 border border-vanilla/15 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 pointer-events-none" style={scoreGlare} />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-vanilla tracking-tight">Optical Integrity</h4>
                  <span className="text-[10px] font-mono text-vanilla-muted uppercase">Perceptual Certainty</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-brunswick/60 text-vanilla text-[10px] font-mono border border-vanilla/20">
                Calibrated
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="py-2 flex items-center justify-center relative">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="#1E1B0A"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="#EB7D00"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(235, 125, 0, 0.65))' }}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-display font-black text-vanilla tracking-tighter">
                    {result.opticalIntegrityScore}
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-tangerine font-bold uppercase mt-0.5">
                    / 100 Index
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-vanilla/10 flex items-center justify-between text-[11px] font-mono text-vanilla-muted">
              <span className="flex items-center gap-1 text-vanilla-soft">
                <ShieldCheck className="w-3.5 h-3.5 text-tangerine" />
                <span>Zero-Hallucination Threshold</span>
              </span>
              <span className="text-tangerine">Passed</span>
            </div>
          </div>

          {/* Detected Objects Ledger Card */}
          <div
            ref={ledgerRef}
            style={ledgerStyle}
            onMouseMove={ledgerMove}
            onMouseLeave={ledgerLeave}
            className="tilt-card glass-surface rounded-3xl p-6 border border-vanilla/15 relative overflow-hidden shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute inset-0 pointer-events-none" style={ledgerGlare} />

            <div>
              {/* Ledger Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-vanilla tracking-tight">Isolated Entities Ledger</h4>
                  <span className="text-[10px] font-mono text-vanilla-muted uppercase">Target Telemetry</span>
                </div>

                <div className="flex items-center gap-1">
                  <Filter className="w-3 h-3 text-tangerine" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-darkbrown border border-vanilla/20 text-vanilla text-[10px] font-mono rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    {result.categories.map(c => (
                      <option key={c.category} value={c.category}>{c.category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objects List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {filteredObjects.map((obj) => {
                  const isSelected = selectedObject?.id === obj.id;

                  return (
                    <div
                      key={obj.id}
                      onClick={() => {
                        audioFX.playClick();
                        setSelectedObject(isSelected ? null : obj);
                      }}
                      onMouseEnter={() => audioFX.playHover()}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-tangerine/15 border-tangerine text-white shadow-[0_0_18px_rgba(235,125,0,0.2)]'
                          : 'bg-darkbrown/50 hover:bg-brunswick/40 border-vanilla/10 text-vanilla-soft'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-tangerine shadow-[0_0_6px_#EB7D00]' : 'bg-vanilla/40'}`} />
                          <span className="text-xs font-semibold text-vanilla truncate">
                            {obj.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-vanilla-muted">
                          <span>{obj.category}</span>
                          <span>•</span>
                          <span>Pos [{obj.bbox.x}%, {obj.bbox.y}%]</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono text-xs font-bold text-tangerine">
                          {obj.confidence}%
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-vanilla-muted" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ledger Footer */}
            <div className="mt-4 pt-3 border-t border-vanilla/10 flex items-center justify-between text-[11px] font-mono text-vanilla-muted">
              <span>Synchronized with HUD overlay</span>
              <span className="text-tangerine font-semibold">{filteredObjects.length} Listed</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
