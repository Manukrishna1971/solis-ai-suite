import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, Scan, ArrowRight, RefreshCw } from 'lucide-react';
import { VISION_PRESETS } from '../../utils/visionEngine';
import { VisionPreset } from '../../types';
import { audioFX } from '../../utils/audioFX';

interface VisionConsoleProps {
  onAnalyzePreset: (preset: VisionPreset) => void;
  onAnalyzeUpload: (imageSrc: string, fileName: string) => void;
  isScanning: boolean;
}

export const VisionConsole: React.FC<VisionConsoleProps> = ({
  onAnalyzePreset,
  onAnalyzeUpload,
  isScanning,
}) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    audioFX.playClick();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      audioFX.playClick();
      processImageFile(e.target.files[0]);
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (src) {
        setSelectedImage({ src, name: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScanUploaded = () => {
    if (selectedImage && !isScanning) {
      audioFX.playClick();
      onAnalyzeUpload(selectedImage.src, selectedImage.name);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 pb-14 relative z-20">
      
      {/* Visual Ingestion Console */}
      <div 
        className={`glass-surface rounded-3xl p-6 sm:p-8 border transition-all duration-300 relative overflow-hidden shadow-2xl ${
          selectedImage ? 'border-tangerine/50 shadow-[0_0_40px_rgba(235,125,0,0.18)]' : 'border-vanilla/15'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-vanilla/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vanilla tracking-tight">
                Optical Telemetry & Spatial Ingestion
              </h3>
              <p className="text-[10px] font-mono text-vanilla-muted">
                Zero-latency computer vision & object localization engine
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-vanilla-muted hidden sm:block">
            <span>YOLOv9 / Feature Pyramid Matrix</span>
          </div>
        </div>

        {/* Dropzone & Preview Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Left: Upload Dropzone or Selected Image */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-tangerine/50 bg-black/60 aspect-[16/10] flex items-center justify-center group shadow-xl">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Remove button */}
                <button
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-darkbrown/80 text-vanilla hover:text-tangerine border border-vanilla/20 backdrop-blur-sm transition-all shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-darkbrown/80 backdrop-blur-md border border-vanilla/10 text-xs font-mono text-vanilla flex items-center justify-between">
                  <span className="truncate max-w-[180px]">{selectedImage.name}</span>
                  <span className="text-tangerine font-bold">READY TO SCAN</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  audioFX.playClick();
                  fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 aspect-[16/10] flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-tangerine bg-tangerine/10 scale-[1.01]'
                    : 'border-vanilla/20 hover:border-tangerine/60 hover:bg-brunswick/20'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-brunswick/50 border border-vanilla/20 text-tangerine flex items-center justify-center mb-3 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-vanilla mb-1">
                  Drop target image or click to upload
                </h4>
                <p className="text-xs text-vanilla-muted max-w-xs leading-relaxed">
                  Supports PNG, JPG, WEBP, SVG • Full spatial entity deconstruction
                </p>
              </div>
            )}
          </div>

          {/* Right: Quick Benchmark Presets */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-vanilla-muted mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-tangerine" />
              <span>Or select a high-fidelity visual benchmark</span>
            </div>

            <div className="space-y-2.5">
              {VISION_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    audioFX.playClick();
                    onAnalyzePreset(preset);
                  }}
                  onMouseEnter={() => audioFX.playHover()}
                  className="group p-3 rounded-2xl bg-brunswick/30 hover:bg-brunswick/60 border border-vanilla/15 hover:border-tangerine/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-darkbrown/80 border border-vanilla/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={preset.imageUrl}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-vanilla group-hover:text-white transition-colors truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-vanilla-muted truncate">
                        {preset.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-darkbrown/60 text-tangerine border border-tangerine/30">
                      {preset.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-vanilla-muted group-hover:text-tangerine group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom CTA for Uploaded Image */}
        {selectedImage && (
          <div className="mt-6 pt-4 border-t border-vanilla/10 flex items-center justify-between">
            <span className="text-xs font-mono text-vanilla-muted">
              Spatial resolution calibrated • Ready for neural inference
            </span>

            <button
              onClick={handleScanUploaded}
              disabled={isScanning}
              className="btn-tangerine-glow px-6 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center gap-2 shadow-tangerine-sm"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Image Matrix...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Initiate Neural Optical Scan</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

    </section>
  );
};
