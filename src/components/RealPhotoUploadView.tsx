import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw, X, Wand2, Smile } from 'lucide-react';
import { detectEnhancedRealObjects, loadRealModel, RealDetection, CVPreprocessingTelemetry } from '../utils/realVisionDetector';
import { audioFX } from '../utils/audioFX';

export const RealPhotoUploadView: React.FC = () => {
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<RealDetection[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cvTelemetry, setCvTelemetry] = useState<CVPreprocessingTelemetry | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pre-load model
  useEffect(() => {
    loadRealModel().catch(console.error);
  }, []);

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
    setImageName(file.name);
    setDetections([]);
    setCvTelemetry(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (src) {
        setSelectedImageSrc(src);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run Enhanced Real Detection when Image Loads
  const handleImageLoaded = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);

    try {
      const { detections: results, cvTelemetry: telemetry } = await detectEnhancedRealObjects(imgRef.current, {
        minConfidence: 0.40,
        useCVPreprocessing: true,
        useTemporalSmoothing: false, // Single image, no smoothing needed
      });

      setDetections(results);
      setCvTelemetry(telemetry);
      audioFX.playSuccess();

      // Draw bounding boxes on canvas
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (canvas && img) {
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const scaleX = img.clientWidth / (img.naturalWidth || img.clientWidth);
          const scaleY = img.clientHeight / (img.naturalHeight || img.clientHeight);

          results.forEach((det) => {
            const [x, y, w, h] = det.bbox;
            const drawX = x * scaleX;
            const drawY = y * scaleY;
            const drawW = w * scaleX;
            const drawH = h * scaleY;

            ctx.save();

            if (det.isFace) {
              // Face & Emotion Box: Vanilla Gold
              ctx.strokeStyle = '#EBE3A7';
              ctx.lineWidth = 2.5;
              ctx.shadowColor = '#EBE3A7';
              ctx.shadowBlur = 14;
              ctx.strokeRect(drawX, drawY, drawW, drawH);

              // Label
              const label = `${det.displayName} (${det.score}%)`;
              ctx.font = 'bold 12px "Space Grotesk", sans-serif';
              const textW = ctx.measureText(label).width + 16;
              ctx.fillStyle = '#2E2910';
              ctx.fillRect(drawX, Math.max(0, drawY - 24), textW, 22);
              ctx.strokeStyle = '#EBE3A7';
              ctx.strokeRect(drawX, Math.max(0, drawY - 24), textW, 22);
              ctx.fillStyle = '#EBE3A7';
              ctx.fillText(label, drawX + 8, Math.max(15, drawY - 8));
            } else if (det.class === 'person') {
              // Person box: Subdued Brunswick Green to avoid clashing with handheld items
              ctx.strokeStyle = 'rgba(44, 87, 69, 0.9)';
              ctx.lineWidth = 2;
              ctx.strokeRect(drawX, drawY, drawW, drawH);

              const label = `Person • ${det.score}%`;
              ctx.font = 'bold 12px "Space Grotesk", sans-serif';
              const textW = ctx.measureText(label).width + 14;
              ctx.fillStyle = '#1A382C';
              ctx.fillRect(drawX, Math.max(0, drawY - 22), textW, 20);
              ctx.fillStyle = '#EBE3A7';
              ctx.fillText(label, drawX + 7, Math.max(15, drawY - 7));
            } else {
              // Object Box (Tangerine)
              ctx.strokeStyle = '#EB7D00';
              ctx.lineWidth = 2.5;
              ctx.shadowColor = '#EB7D00';
              ctx.shadowBlur = 16;
              ctx.strokeRect(drawX, drawY, drawW, drawH);

              // Corner Crosshairs
              const tick = 10;
              ctx.strokeStyle = '#FFA23A';
              ctx.lineWidth = 3;
              ctx.shadowBlur = 0;
              ctx.beginPath();
              ctx.moveTo(drawX, drawY + tick); ctx.lineTo(drawX, drawY); ctx.lineTo(drawX + tick, drawY);
              ctx.moveTo(drawX + drawW - tick, drawY); ctx.lineTo(drawX + drawW, drawY); ctx.lineTo(drawX + drawW, drawY + tick);
              ctx.moveTo(drawX, drawY + drawH - tick); ctx.lineTo(drawX, drawY + drawH); ctx.lineTo(drawX + tick, drawY + drawH);
              ctx.moveTo(drawX + drawW - tick, drawY + drawH); ctx.lineTo(drawX + drawW, drawY + drawH); ctx.lineTo(drawX + drawW, drawY + drawH - tick);
              ctx.stroke();

              // Label
              const label = `${det.displayName} • ${det.score}%`;
              ctx.font = 'bold 12px "Space Grotesk", sans-serif';
              const textW = ctx.measureText(label).width + 16;
              ctx.fillStyle = '#EB7D00';
              ctx.fillRect(drawX, Math.max(0, drawY - 24), textW, 22);
              ctx.fillStyle = '#161408';
              ctx.fillText(label, drawX + 8, Math.max(15, drawY - 8));
            }

            ctx.restore();
          });
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setSelectedImageSrc(null);
    setImageName('');
    setDetections([]);
    setCvTelemetry(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const faceDetections = detections.filter((d) => d.isFace);
  const objectDetections = detections.filter((d) => !d.isFace);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 relative z-20">
      
      {/* Header Card */}
      <div className="glass-surface rounded-2xl p-4 sm:p-5 mb-5 border border-vanilla/15 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-vanilla uppercase tracking-wide">
              Photo Upload Recognition
            </h3>
            <p className="text-xs text-vanilla-muted mt-0.5">
              Enhanced with computer vision contrast & sharpness equalization for degraded photos.
            </p>
          </div>
        </div>

        {selectedImageSrc && (
          <div className="flex items-center gap-2">
            {cvTelemetry?.contrastBoostApplied && (
              <span className="px-2.5 py-1 rounded-lg bg-brunswick text-tangerine border border-tangerine/30 text-[11px] font-mono flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                <span>CV Enhanced</span>
              </span>
            )}
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-xl bg-darkbrown/80 hover:bg-brunswick text-vanilla text-xs border border-vanilla/15 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Upload Another</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Dropzone / Image Viewport */}
      {!selectedImageSrc ? (
        <div
          onClick={() => {
            audioFX.playClick();
            fileInputRef.current?.click();
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 aspect-[16/9] flex flex-col items-center justify-center glass-surface ${
            isDragging
              ? 'border-tangerine bg-tangerine/10 scale-[1.01]'
              : 'border-vanilla/25 hover:border-tangerine/60 hover:bg-brunswick/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-brunswick/50 border border-vanilla/20 text-tangerine flex items-center justify-center mb-4 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h4 className="text-base font-bold text-vanilla mb-1">
            Drop your photo here or click to browse
          </h4>
          <p className="text-xs text-vanilla-muted max-w-sm leading-relaxed">
            Automatic contrast stretching & edge sharpening applied to dark or blurry photos
          </p>
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden glass-surface border border-vanilla/25 shadow-2xl bg-black/95 flex items-center justify-center">
          
          {/* Target Image */}
          <img
            ref={imgRef}
            src={selectedImageSrc}
            alt={imageName}
            onLoad={handleImageLoaded}
            className="w-full h-full object-contain"
          />

          {/* Canvas Overlay for Bounding Boxes */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-20 w-full h-full"
          />

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <RefreshCw className="w-8 h-8 text-tangerine animate-spin mb-2" />
              <span className="text-xs font-mono text-vanilla uppercase tracking-widest font-bold">
                Applying CV Enhancement & Neural Recognition...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Results Summary Box */}
      {selectedImageSrc && !isProcessing && (
        <div className="mt-5 glass-surface rounded-2xl p-4 sm:p-5 border border-vanilla/15 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-vanilla-muted flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-tangerine" />
              <span>Identified Entities ({detections.length})</span>
            </span>
            <span className="text-xs font-mono text-tangerine font-bold">
              {imageName}
            </span>
          </div>

          {detections.length === 0 ? (
            <div className="py-4 text-center text-xs font-mono text-vanilla-muted">
              No objects or faces detected in this photo.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Face & Emotion Pills */}
              {faceDetections.map((f) => (
                <div
                  key={f.id}
                  className="px-3.5 py-2 rounded-xl bg-brunswick/90 border border-vanilla/30 text-vanilla font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Smile className="w-4 h-4 text-tangerine" />
                  <span>{f.displayName}</span>
                  <span className="text-[10px] font-mono text-tangerine bg-darkbrown px-1.5 py-0.5 rounded font-black">
                    {f.score}%
                  </span>
                  {f.valence !== undefined && (
                    <span className="text-[10px] font-mono text-vanilla-muted border-l border-vanilla/20 pl-1.5">
                      Valence {f.valence > 0 ? `+${f.valence}%` : `${f.valence}%`}
                    </span>
                  )}
                </div>
              ))}

              {/* Real Object Pills */}
              {objectDetections.map((obj) => (
                <div
                  key={obj.id}
                  className="px-3.5 py-2 rounded-xl bg-tangerine/15 border border-tangerine/50 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-tangerine" />
                  <span>{obj.displayName}</span>
                  <span className="text-[10px] font-mono text-darkbrown-deep bg-tangerine px-1.5 py-0.5 rounded font-black">
                    {obj.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
