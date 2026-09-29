import React, { useState } from 'react';
import { Eye, Shield, Tag, Maximize2 } from 'lucide-react';
import { DetectedObject } from '../../types';
import { audioFX } from '../../utils/audioFX';

interface VisionCanvasProps {
  imageSrc: string;
  imageName: string;
  objects: DetectedObject[];
  selectedObjectId?: string | null;
  onSelectObject: (obj: DetectedObject | null) => void;
  isScanning?: boolean;
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  imageSrc,
  imageName,
  objects,
  selectedObjectId,
  onSelectObject,
  isScanning = false,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  const activeId = selectedObjectId || hoveredObjectId;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-surface border border-vanilla/20 shadow-2xl bg-black/60 select-none">
      
      {/* Top Canvas Control Bar */}
      <div className="px-4 py-2.5 bg-darkbrown/80 border-b border-vanilla/15 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-vanilla">
          <span className="w-2 h-2 rounded-full bg-tangerine animate-pulse" />
          <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{imageName}</span>
          <span className="text-vanilla-muted hidden sm:inline">•</span>
          <span className="text-tangerine hidden sm:inline">{objects.length} Objects Isolated</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Bounding Boxes */}
          <button
            onClick={() => {
              audioFX.playClick();
              setShowBoxes(!showBoxes);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
              showBoxes 
                ? 'bg-tangerine/20 text-tangerine border-tangerine/40 font-bold' 
                : 'text-vanilla-muted border-vanilla/10 hover:text-vanilla'
            }`}
          >
            HUD Boxes
          </button>

          {/* Toggle Labels */}
          <button
            onClick={() => {
              audioFX.playClick();
              setShowLabels(!showLabels);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
              showLabels 
                ? 'bg-brunswick/60 text-vanilla border-vanilla/30 font-bold' 
                : 'text-vanilla-muted border-vanilla/10 hover:text-vanilla'
            }`}
          >
            Labels
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden flex items-center justify-center bg-black/80">
        
        {/* Underlying Image */}
        <img
          src={imageSrc}
          alt={imageName}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Laser Radar Scanning Sweep Animation */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-tangerine to-transparent shadow-[0_0_20px_#EB7D00] animate-scan-line" />
            <div className="absolute inset-0 bg-tangerine/5 animate-pulse" />
          </div>
        )}

        {/* Interactive Bounding Boxes Overlay */}
        {showBoxes && (
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {objects.map((obj) => {
              const isActive = activeId === obj.id;

              return (
                <div
                  key={obj.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    audioFX.playClick();
                    onSelectObject(isActive ? null : obj);
                  }}
                  onMouseEnter={() => {
                    audioFX.playHover();
                    setHoveredObjectId(obj.id);
                  }}
                  onMouseLeave={() => setHoveredObjectId(null)}
                  style={{
                    left: `${obj.bbox.x}%`,
                    top: `${obj.bbox.y}%`,
                    width: `${obj.bbox.width}%`,
                    height: `${obj.bbox.height}%`,
                  }}
                  className={`absolute cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'border-2 border-tangerine bg-tangerine/20 shadow-[0_0_25px_rgba(235,125,0,0.65)] z-30'
                      : 'border border-tangerine/70 hover:border-tangerine hover:bg-tangerine/10 shadow-[0_0_8px_rgba(235,125,0,0.25)]'
                  }`}
                >
                  {/* Corner Reticle Crosshairs */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-vanilla" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-vanilla" />
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-vanilla" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-vanilla" />

                  {/* Center reticle on hover */}
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3 h-3 border border-tangerine/80 rotate-45" />
                    </div>
                  )}

                  {/* Object Label Pill */}
                  {showLabels && (
                    <div 
                      className={`absolute -top-6 left-0 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 transition-all shadow-md ${
                        isActive
                          ? 'bg-tangerine text-darkbrown-deep font-bold border border-vanilla shadow-[0_0_12px_#EB7D00]'
                          : 'bg-darkbrown-deep/90 text-vanilla border border-tangerine/50 backdrop-blur-sm'
                      }`}
                    >
                      <span>{obj.label}</span>
                      <span className={isActive ? 'text-darkbrown font-black' : 'text-tangerine font-bold'}>
                        {obj.confidence}%
                      </span>
                    </div>
                  )}

                  {/* Active Tooltip with Coordinates */}
                  {isActive && (
                    <div className="absolute -bottom-8 left-0 whitespace-nowrap px-2 py-0.5 rounded text-[9px] font-mono bg-brunswick/90 text-vanilla border border-vanilla/20 shadow-lg pointer-events-none">
                      POS: [{obj.bbox.x}%, {obj.bbox.y}%] • {obj.category}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Bottom Bar Info */}
      <div className="px-4 py-2 bg-darkbrown/60 border-t border-vanilla/10 flex items-center justify-between text-[11px] font-mono text-vanilla-muted">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-tangerine" />
          <span>Click any target box to inspect spatial telemetry</span>
        </span>
        <span className="text-vanilla-soft">
          Multi-spectral HUD • 60 FPS Optical Engine
        </span>
      </div>

    </div>
  );
};
