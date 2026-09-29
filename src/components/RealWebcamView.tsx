import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  FlipHorizontal, 
  RefreshCw, 
  Zap, 
  Sliders, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Wand2, 
  Layers, 
  Smile, 
  BrainCircuit, 
  Hand,
  Activity
} from 'lucide-react';
import { 
  detectEnhancedRealObjects, 
  loadRealModel, 
  RealDetection, 
  CVPreprocessingTelemetry, 
  TemporalObjectTracker 
} from '../utils/realVisionDetector';
import { CustomTrainerModal } from './CustomTrainerModal';
import { audioFX } from '../utils/audioFX';

export const RealWebcamView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<TemporalObjectTracker>(new TemporalObjectTracker());

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [modelLoadingStatus, setModelLoadingStatus] = useState<string>('Initializing neural model...');
  const [isModelReady, setIsModelReady] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(55);
  
  // CV & Stabilization Toggles
  const [useCVEnhancer, setUseCVEnhancer] = useState(true);
  const [useStabilizer, setUseStabilizer] = useState(true);
  const [detectHands, setDetectHands] = useState(true);
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);

  // Real-time telemetry
  const [detections, setDetections] = useState<RealDetection[]>([]);
  const [fps, setFps] = useState(0);
  const [cvTelemetry, setCvTelemetry] = useState<CVPreprocessingTelemetry>({
    originalLuminance: 128,
    contrastBoostApplied: false,
    sharpnessApplied: false,
  });

  const isDetectingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const lastFpsTimeRef = useRef(performance.now());
  const framesCountRef = useRef(0);

  // Initialize model on mount
  useEffect(() => {
    let mounted = true;
    loadRealModel((msg) => {
      if (mounted) setModelLoadingStatus(msg);
    })
      .then(() => {
        if (mounted) {
          setIsModelReady(true);
          setModelLoadingStatus('Model Ready');
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error(err);
          setModelLoadingStatus('Model initialization error');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Camera Management
  const startCamera = useCallback(async () => {
    try {
      setPermissionError(null);
      audioFX.playClick();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied';
      setPermissionError(errorMsg);
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    audioFX.playClick();
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setDetections([]);
    trackerRef.current.reset();
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  useEffect(() => {
    if (isModelReady && !isCameraActive && !permissionError) {
      startCamera();
    }
  }, [isModelReady, isCameraActive, permissionError, startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stopCamera]);

  // Real-Time Detection Loop
  useEffect(() => {
    if (!isCameraActive || !isModelReady) return;

    let mounted = true;

    const detectFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && !isDetectingRef.current) {
        isDetectingRef.current = true;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }

        try {
          const { detections: results, cvTelemetry: telemetry } = await detectEnhancedRealObjects(video, {
            minConfidence: confidenceThreshold / 100,
            useCVPreprocessing: useCVEnhancer,
            useTemporalSmoothing: useStabilizer,
            detectHands: detectHands,
            tracker: trackerRef.current,
          });

          if (mounted) {
            setDetections(results);
            setCvTelemetry(telemetry);

            framesCountRef.current++;
            const now = performance.now();
            if (now - lastFpsTimeRef.current >= 500) {
              setFps(Math.round((framesCountRef.current * 1000) / (now - lastFpsTimeRef.current)));
              framesCountRef.current = 0;
              lastFpsTimeRef.current = now;
            }

            // Draw Real Bounding Boxes on Canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              results.forEach((det) => {
                let [x, y, w, h] = det.bbox;

                if (isMirrored) {
                  x = canvas.width - (x + w);
                }

                ctx.save();

                // 1. HAND MOVEMENT & GESTURE RETICLE
                if (det.isHand && det.handInfo) {
                  ctx.strokeStyle = '#FFA23A';
                  ctx.lineWidth = 2.5;
                  ctx.shadowColor = '#EB7D00';
                  ctx.shadowBlur = 16;
                  ctx.strokeRect(x, y, w, h);

                  // Reticle crosshair ticks
                  const tick = 12;
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.lineWidth = 3;
                  ctx.shadowBlur = 0;
                  ctx.beginPath();
                  ctx.moveTo(x, y + tick); ctx.lineTo(x, y); ctx.lineTo(x + tick, y);
                  ctx.moveTo(x + w - tick, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + tick);
                  ctx.moveTo(x, y + h - tick); ctx.lineTo(x, y + h); ctx.lineTo(x + tick, y + h);
                  ctx.moveTo(x + w - tick, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - tick);
                  ctx.stroke();

                  // Movement Direction Velocity Indicator
                  if (det.handInfo.movement !== 'Stationary') {
                    ctx.fillStyle = '#EB7D00';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText(`MOTION: ${det.handInfo.movement}`, x + 6, y + h + 18);
                  }

                  // Label Pill
                  const labelText = `${det.displayName}`;
                  ctx.font = 'bold 13px "Space Grotesk", sans-serif';
                  const pillW = ctx.measureText(labelText).width + 18;

                  ctx.fillStyle = '#EB7D00';
                  ctx.fillRect(x, Math.max(0, y - 28), pillW, 26);
                  ctx.fillStyle = '#161408';
                  ctx.fillText(labelText, x + 9, Math.max(18, y - 10));
                }

                // 2. FACE & EMOTION RETICLE
                else if (det.isFace) {
                  ctx.strokeStyle = '#EBE3A7';
                  ctx.lineWidth = 2.5;
                  ctx.shadowColor = '#EBE3A7';
                  ctx.shadowBlur = 14;
                  ctx.strokeRect(x, y, w, h);

                  const tick = 10;
                  ctx.strokeStyle = '#EB7D00';
                  ctx.lineWidth = 3;
                  ctx.shadowBlur = 0;
                  ctx.beginPath();
                  ctx.moveTo(x, y + tick); ctx.lineTo(x, y); ctx.lineTo(x + tick, y);
                  ctx.moveTo(x + w - tick, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + tick);
                  ctx.moveTo(x, y + h - tick); ctx.lineTo(x, y + h); ctx.lineTo(x + tick, y + h);
                  ctx.moveTo(x + w - tick, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - tick);
                  ctx.stroke();

                  const labelText = `${det.displayName} (${det.score}%)`;
                  ctx.font = 'bold 13px "Space Grotesk", sans-serif';
                  const pillW = ctx.measureText(labelText).width + 18;

                  ctx.fillStyle = '#2E2910';
                  ctx.fillRect(x, Math.max(0, y - 28), pillW, 26);
                  ctx.strokeStyle = '#EBE3A7';
                  ctx.lineWidth = 1.5;
                  ctx.strokeRect(x, Math.max(0, y - 28), pillW, 26);

                  ctx.fillStyle = '#EBE3A7';
                  ctx.fillText(labelText, x + 9, Math.max(18, y - 10));
                }

                // 3. PERSON CONTOUR
                else if (det.class === 'person') {
                  ctx.strokeStyle = 'rgba(44, 87, 69, 0.85)';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(x, y, w, h);

                  const labelText = `Person • ${det.score}%`;
                  ctx.font = 'bold 12px "Space Grotesk", sans-serif';
                  const pillW = ctx.measureText(labelText).width + 14;

                  ctx.fillStyle = '#1A382C';
                  ctx.fillRect(x, Math.max(0, y - 24), pillW, 22);
                  ctx.fillStyle = '#EBE3A7';
                  ctx.fillText(labelText, x + 7, Math.max(16, y - 8));
                }

                // 4. OBJECTS (Mobile, Ironbox, Specs, Pen, Car, Bike, etc.)
                else {
                  ctx.strokeStyle = '#EB7D00';
                  ctx.lineWidth = 2.5;
                  ctx.shadowColor = '#EB7D00';
                  ctx.shadowBlur = 18;
                  ctx.strokeRect(x, y, w, h);

                  const tick = 12;
                  ctx.strokeStyle = '#FFA23A';
                  ctx.lineWidth = 3;
                  ctx.shadowBlur = 0;
                  ctx.beginPath();
                  ctx.moveTo(x, y + tick); ctx.lineTo(x, y); ctx.lineTo(x + tick, y);
                  ctx.moveTo(x + w - tick, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + tick);
                  ctx.moveTo(x, y + h - tick); ctx.lineTo(x, y + h); ctx.lineTo(x + tick, y + h);
                  ctx.moveTo(x + w - tick, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - tick);
                  ctx.stroke();

                  const labelText = `${det.displayName} • ${det.score}%`;
                  ctx.font = 'bold 13px "Space Grotesk", sans-serif';
                  const pillW = ctx.measureText(labelText).width + 16;

                  ctx.fillStyle = '#EB7D00';
                  ctx.fillRect(x, Math.max(0, y - 28), pillW, 26);
                  ctx.fillStyle = '#161408';
                  ctx.fillText(labelText, x + 8, Math.max(18, y - 10));
                }

                ctx.restore();
              });
            }
          }
        } catch {
          // Continue
        } finally {
          isDetectingRef.current = false;
        }
      }

      if (mounted && isCameraActive) {
        animFrameRef.current = requestAnimationFrame(detectFrame);
      }
    };

    animFrameRef.current = requestAnimationFrame(detectFrame);

    return () => {
      mounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, isModelReady, isMirrored, confidenceThreshold, useCVEnhancer, useStabilizer, detectHands]);

  const faceDetections = detections.filter((d) => d.isFace);
  const handDetections = detections.filter((d) => d.isHand);
  const objectDetections = detections.filter((d) => !d.isFace && !d.isHand);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 relative z-20">
      
      {/* Top Status & CV Quality Bar */}
      <div className="glass-surface rounded-2xl p-4 sm:p-5 mb-5 border border-vanilla/15 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCameraActive ? 'bg-tangerine' : 'bg-red-500'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCameraActive ? 'bg-tangerine' : 'bg-red-500'}`} />
              </span>
              <h3 className="text-sm font-bold text-vanilla uppercase tracking-wide">
                Live AI Vision & Hand Movement Engine
              </h3>
            </div>
            <p className="text-xs text-vanilla-muted mt-0.5">
              Recognizes Mobile, Ironbox, Specs, Pen, Car, Bike, Faces, and Hand Gestures.
            </p>
          </div>
        </div>

        {/* Live CV Quality Telemetry & Teach Object Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => {
              audioFX.playClick();
              setIsTrainerOpen(true);
            }}
            className="btn-tangerine-glow px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Teach Any Object</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-darkbrown border border-vanilla/15 text-vanilla flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-tangerine" />
            <span>{fps} FPS</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-darkbrown border border-vanilla/15 text-tangerine font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{detections.length} Entities</span>
          </div>
        </div>
      </div>

      {/* Model Loading Banner */}
      {!isModelReady && (
        <div className="mb-5 p-4 rounded-2xl bg-brunswick/50 border border-tangerine/50 flex items-center justify-center gap-3 text-xs font-mono text-vanilla animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-tangerine" />
          <span>{modelLoadingStatus}</span>
        </div>
      )}

      {/* Permission Error Slate */}
      {permissionError && (
        <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs font-mono text-vanilla flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Camera permission required: {permissionError}. Please allow camera access in browser.</span>
          </div>
          <button
            onClick={startCamera}
            className="px-3 py-1 rounded-lg bg-tangerine text-darkbrown-deep font-bold"
          >
            Allow & Retry
          </button>
        </div>
      )}

      {/* Main Webcam Viewport */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden glass-surface border border-vanilla/25 shadow-2xl bg-black/95">
        
        {/* Real Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirrored ? 'scale-x-[-1]' : 'scale-x-100'
          } ${!isCameraActive ? 'hidden' : 'block'}`}
        />

        {/* Real-Time Detection Bounding Boxes Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-20 w-full h-full"
        />

        {/* Standby screen when camera is stopped */}
        {!isCameraActive && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-[#141207]">
            <CameraOff className="w-14 h-14 text-vanilla-muted/40 mb-3" />
            <h4 className="text-base font-bold text-vanilla mb-1">Camera Is In Standby</h4>
            <p className="text-xs text-vanilla-muted max-w-sm mb-4">
              Engage camera to recognize objects, hand movements, and facial emotions.
            </p>
            <button
              onClick={startCamera}
              disabled={!isModelReady}
              className="btn-tangerine-glow px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-tangerine-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Turn On Camera</span>
            </button>
          </div>
        )}

        {/* Floating Controls Inside Viewport */}
        {isCameraActive && (
          <div className="absolute bottom-4 inset-x-4 z-30 flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className="p-2.5 rounded-xl bg-darkbrown/85 hover:bg-brunswick/80 text-vanilla border border-vanilla/15 backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5 text-xs font-mono"
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-tangerine" />
              <span>{isMirrored ? 'Mirrored' : 'Normal'}</span>
            </button>

            <button
              onClick={stopCamera}
              className="p-2.5 rounded-xl bg-darkbrown/85 hover:bg-red-950/80 text-red-400 border border-vanilla/15 backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5 text-xs font-mono"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Camera</span>
            </button>
          </div>
        )}

      </div>

      {/* Enhanced CV & Hand Movement Controls */}
      <div className="mt-4 glass-surface rounded-2xl p-4 border border-vanilla/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        
        {/* CV & Gesture Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              audioFX.playClick();
              setDetectHands(!detectHands);
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              detectHands
                ? 'bg-tangerine/20 border-tangerine text-tangerine font-bold'
                : 'bg-darkbrown/60 border-vanilla/15 text-vanilla-muted hover:text-vanilla'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Hand Movement & Gestures: {detectHands ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              audioFX.playClick();
              setUseCVEnhancer(!useCVEnhancer);
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              useCVEnhancer
                ? 'bg-brunswick/60 border-vanilla/30 text-vanilla font-bold'
                : 'bg-darkbrown/60 border-vanilla/15 text-vanilla-muted hover:text-vanilla'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Low-Light Booster: {useCVEnhancer ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-tangerine" />
          <span className="text-vanilla-muted">Sensitivity:</span>
          <input
            type="range"
            min="30"
            max="80"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            className="w-20 accent-tangerine cursor-pointer"
          />
          <span className="text-tangerine font-bold">{confidenceThreshold}%</span>
        </div>

      </div>

      {/* Live Recognized Entities Bar */}
      <div className="mt-4 space-y-3">
        <div className="glass-surface rounded-2xl p-4 border border-vanilla/15">
          <div className="text-xs font-mono uppercase tracking-wider text-vanilla-muted mb-2.5 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-tangerine" />
            <span>Currently Recognized in Frame ({detections.length})</span>
          </div>

          {detections.length === 0 ? (
            <div className="py-4 text-center text-xs font-mono text-vanilla-muted/60">
              No objects, hands, or faces currently in view. Wave your hand, or point camera at a phone, pen, ironbox, or specs.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              
              {/* Hand Movement & Gesture Badges */}
              {handDetections.map((h) => (
                <div
                  key={h.id}
                  className="px-3.5 py-2 rounded-xl bg-amber-950/80 border border-tangerine/60 text-white font-bold text-xs flex items-center gap-2 shadow-md animate-in fade-in"
                >
                  <Hand className="w-4 h-4 text-tangerine" />
                  <span>{h.displayName}</span>
                  {h.handInfo && (
                    <span className="text-[10px] font-mono text-tangerine bg-darkbrown px-1.5 py-0.5 rounded border border-tangerine/30">
                      {h.handInfo.movement}
                    </span>
                  )}
                </div>
              ))}

              {/* Fine-Tuned Face & Emotion Badges */}
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

              {/* Real Object Badges (Mobile, Ironbox, Specs, Pen, Car, Bike, etc.) */}
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
      </div>

      {/* Interactive Custom Object Trainer Modal */}
      <CustomTrainerModal
        isOpen={isTrainerOpen}
        onClose={() => setIsTrainerOpen(false)}
        videoElement={videoRef.current}
        onTrainingComplete={() => setIsTrainerOpen(false)}
      />

    </div>
  );
};
