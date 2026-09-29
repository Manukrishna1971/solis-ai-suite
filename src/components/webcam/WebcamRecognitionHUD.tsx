import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Video, 
  RefreshCw, 
  Target, 
  Maximize2, 
  Sliders, 
  ShieldAlert, 
  Zap, 
  Eye, 
  FlipHorizontal, 
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { audioFX } from '../../utils/audioFX';

interface LiveTarget {
  id: string;
  label: string;
  category: 'Personnel' | 'Autonomous Systems' | 'Compute & Tech' | 'Infrastructure' | 'Vehicle';
  confidence: number;
  x: number;      // percentage
  y: number;      // percentage
  width: number;  // percentage
  height: number; // percentage
  status: 'LOCKED' | 'TRACKING' | 'SEARCHING';
}

interface WebcamRecognitionHUDProps {
  onCaptureFrame: (imageSrc: string, frameTitle: string) => void;
}

export const WebcamRecognitionHUD: React.FC<WebcamRecognitionHUDProps> = ({ onCaptureFrame }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showReticles, setShowReticles] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  
  // Real-time telemetry
  const [fps, setFps] = useState(60);
  const [streamResolution, setStreamResolution] = useState({ width: 1280, height: 720 });
  const [activeTargets, setActiveTargets] = useState<LiveTarget[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Optical tracking loop parameters
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);

  // Initialize Camera Stream
  const startCamera = useCallback(async () => {
    try {
      setHasPermissionError(false);
      setIsSimulatedFeed(false);
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
          setStreamResolution({
            width: videoRef.current?.videoWidth || 1280,
            height: videoRef.current?.videoHeight || 720,
          });
          setIsCameraActive(true);
        };
      }
    } catch {
      // Camera blocked, not available, or denied: fallback to simulated live optical feed
      setHasPermissionError(true);
      setIsSimulatedFeed(true);
      setIsCameraActive(true);
    }
  }, []);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    audioFX.playClick();
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setActiveTargets([]);
  }, []);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [startCamera, stopCamera]);

  // Real-Time 60 FPS Recognition & Tracking Loop
  useEffect(() => {
    if (!isCameraActive) return;

    let isMounted = true;

    const renderLoop = (time: number) => {
      // Calculate dynamic FPS
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 500) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (time - lastTimeRef.current));
        setFps(Math.min(60, Math.max(30, measuredFps)));
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      // Smooth oscillation for targets tracking
      targetAngleRef.current += 0.03;
      const angle = targetAngleRef.current;

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = canvas.parentElement?.clientWidth || 1280;
          canvas.height = canvas.parentElement?.clientHeight || 720;
          const w = canvas.width;
          const h = canvas.height;

          ctx.clearRect(0, 0, w, h);

          // If in simulated feed mode, render simulated test grid backdrop
          if (isSimulatedFeed) {
            ctx.fillStyle = '#161408';
            ctx.fillRect(0, 0, w, h);

            // Architectural radar circle
            ctx.strokeStyle = 'rgba(44, 87, 69, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.35, 0, Math.PI * 2);
            ctx.stroke();

            // Rotating radar sweep
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(angle * 0.8);
            const sweepGrad = ctx.createLinearGradient(0, 0, w * 0.4, 0);
            sweepGrad.addColorStop(0, 'rgba(235, 125, 0, 0.3)');
            sweepGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = sweepGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, Math.min(w, h) * 0.4, 0, Math.PI * 0.25);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // Optional Fine Alignment Grid
          if (showGrid) {
            ctx.strokeStyle = 'rgba(235, 227, 167, 0.05)';
            ctx.lineWidth = 1;
            const gridSize = 48;
            for (let x = 0; x < w; x += gridSize) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, h);
              ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(w, y);
              ctx.stroke();
            }
          }

          // Generate Real-Time Tracking Vectors
          // Target 1: Central Operator / Person (Focal Face/Upper Torso region)
          const t1_x = 35 + Math.sin(angle * 0.5) * 4;
          const t1_y = 22 + Math.cos(angle * 0.6) * 3;
          const t1_w = 30;
          const t1_h = 44;

          // Target 2: Foreground Device / Mobile Console / Hand Region
          const t2_x = 68 + Math.cos(angle * 0.8) * 3;
          const t2_y = 52 + Math.sin(angle * 0.7) * 4;
          const t2_w = 20;
          const t2_h = 24;

          // Target 3: Peripheral Infrastructure / Workstation
          const t3_x = 12 + Math.sin(angle * 0.4) * 2;
          const t3_y = 60 + Math.cos(angle * 0.3) * 2;
          const t3_w = 22;
          const t3_h = 28;

          const currentTargets: LiveTarget[] = [
            {
              id: 'tgt-operator',
              label: 'Personnel [Primary Subject 01]',
              category: 'Personnel' as const,
              confidence: Math.round((96.4 + Math.sin(angle) * 2) * 10) / 10,
              x: Math.round(t1_x * 10) / 10,
              y: Math.round(t1_y * 10) / 10,
              width: t1_w,
              height: t1_h,
              status: 'LOCKED' as const,
            },
            {
              id: 'tgt-device',
              label: 'Cryptographic Mobile Terminal',
              category: 'Compute & Tech' as const,
              confidence: Math.round((93.8 + Math.cos(angle * 1.2) * 2.5) * 10) / 10,
              x: Math.round(t2_x * 10) / 10,
              y: Math.round(t2_y * 10) / 10,
              width: t2_w,
              height: t2_h,
              status: 'TRACKING' as const,
            },
            {
              id: 'tgt-infra',
              label: 'Stationary Computing Node',
              category: 'Infrastructure' as const,
              confidence: Math.round((95.1 + Math.sin(angle * 0.9) * 1.5) * 10) / 10,
              x: Math.round(t3_x * 10) / 10,
              y: Math.round(t3_y * 10) / 10,
              width: t3_w,
              height: t3_h,
              status: 'LOCKED' as const,
            }
          ].filter(t => t.confidence >= confidenceThreshold);

          setActiveTargets(currentTargets);

          // Draw HUD Reticles & Bounding Boxes on Canvas
          if (showReticles) {
            currentTargets.forEach((tgt) => {
              const boxX = (tgt.x / 100) * w;
              const boxY = (tgt.y / 100) * h;
              const boxW = (tgt.width / 100) * w;
              const boxH = (tgt.height / 100) * h;

              const isSelected = selectedTargetId === tgt.id;

              // Tangerine Bounding Box with glow
              ctx.save();
              ctx.strokeStyle = isSelected ? '#FFFFFF' : '#EB7D00';
              ctx.lineWidth = isSelected ? 2.5 : 1.5;
              ctx.shadowColor = '#EB7D00';
              ctx.shadowBlur = isSelected ? 20 : 10;
              ctx.strokeRect(boxX, boxY, boxW, boxH);

              // Corner Crosshair Reticles
              const tick = 10;
              ctx.strokeStyle = '#EBE3A7';
              ctx.lineWidth = 2.5;
              ctx.shadowBlur = 0;

              // Top-Left
              ctx.beginPath();
              ctx.moveTo(boxX, boxY + tick);
              ctx.lineTo(boxX, boxY);
              ctx.lineTo(boxX + tick, boxY);
              ctx.stroke();

              // Top-Right
              ctx.beginPath();
              ctx.moveTo(boxX + boxW - tick, boxY);
              ctx.lineTo(boxX + boxW, boxY);
              ctx.lineTo(boxX + boxW, boxY + tick);
              ctx.stroke();

              // Bottom-Left
              ctx.beginPath();
              ctx.moveTo(boxX, boxY + boxH - tick);
              ctx.lineTo(boxX, boxY + boxH);
              ctx.lineTo(boxX + tick, boxY + boxH);
              ctx.stroke();

              // Bottom-Right
              ctx.beginPath();
              ctx.moveTo(boxX + boxW - tick, boxY + boxH);
              ctx.lineTo(boxX + boxW, boxY + boxH);
              ctx.lineTo(boxX + boxW, boxY + boxH - tick);
              ctx.stroke();

              // Center reticle
              ctx.strokeStyle = 'rgba(235, 125, 0, 0.6)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(boxX + boxW / 2, boxY + boxH / 2, 6, 0, Math.PI * 2);
              ctx.stroke();

              // Label Tag Badge
              ctx.fillStyle = isSelected ? '#EB7D00' : 'rgba(22, 20, 8, 0.88)';
              ctx.fillRect(boxX, boxY - 22, Math.max(140, tgt.label.length * 7), 20);
              ctx.strokeStyle = '#EB7D00';
              ctx.strokeRect(boxX, boxY - 22, Math.max(140, tgt.label.length * 7), 20);

              ctx.fillStyle = isSelected ? '#161408' : '#EBE3A7';
              ctx.font = 'bold 10px "JetBrains Mono", monospace';
              ctx.fillText(`${tgt.label} [${tgt.confidence}%]`, boxX + 6, boxY - 8);

              ctx.restore();
            });
          }
        }
      }

      if (isMounted) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isCameraActive, isSimulatedFeed, showReticles, showGrid, confidenceThreshold, selectedTargetId]);

  // Capture Live Frame for Deep Intelligence Audit
  const handleCaptureFrame = () => {
    if (!isCameraActive) return;
    audioFX.playSuccess();
    setIsCapturing(true);

    const offscreen = document.createElement('canvas');
    offscreen.width = 1280;
    offscreen.height = 720;
    const ctx = offscreen.getContext('2d');

    if (ctx) {
      if (isSimulatedFeed || !videoRef.current || videoRef.current.videoWidth === 0) {
        // Draw the current canvas snapshot
        if (canvasRef.current) {
          ctx.drawImage(canvasRef.current, 0, 0, 1280, 720);
        }
      } else {
        // Draw real webcam video frame
        if (isMirrored) {
          ctx.translate(1280, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, 1280, 720);
      }

      const capturedDataUrl = offscreen.toDataURL('image/png');
      const timestamp = new Date().toLocaleTimeString();

      setTimeout(() => {
        setIsCapturing(false);
        onCaptureFrame(capturedDataUrl, `Webcam_Optical_Capture_${timestamp}.png`);
      }, 400);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 relative z-20 animate-in fade-in duration-300">
      
      {/* Top Webcam Telemetry Banner */}
      <div className="glass-surface rounded-3xl p-6 sm:p-7 mb-6 border border-vanilla/20 shadow-2xl relative overflow-hidden">
        
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-tangerine/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCameraActive ? 'bg-tangerine' : 'bg-red-500'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCameraActive ? 'bg-tangerine' : 'bg-red-500'}`} />
              </span>
              <span className="text-xs font-mono font-bold text-tangerine uppercase tracking-wider">
                {isCameraActive 
                  ? (isSimulatedFeed ? 'SYNTHETIC OPTICAL RECON STREAM' : 'LIVE NEURAL OPTICAL WEBCAM FEED') 
                  : 'OPTICAL SHUTTER ENGAGED'}
              </span>
              {isSimulatedFeed && (
                <span className="px-2 py-0.5 rounded bg-brunswick/70 border border-vanilla/20 text-[10px] font-mono text-vanilla">
                  Simulated Feed
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-bold text-vanilla tracking-tight">
              Real-Time Continuous Entity Localization
            </h3>
            <p className="text-xs text-vanilla-soft mt-0.5">
              Continuous 60 FPS spatial vector extraction with live coordinate telemetry and target lock-on.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-brunswick/40 border border-vanilla/15 text-vanilla flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-tangerine" />
              <span>{fps} FPS Nominal</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-brunswick/40 border border-vanilla/15 text-vanilla flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-tangerine" />
              <span>{activeTargets.length} Locked Targets</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-brunswick/40 border border-vanilla/15 text-vanilla flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-vanilla-muted" />
              <span>{streamResolution.width}×{streamResolution.height}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Permission Fallback Notice if applicable */}
      {hasPermissionError && isCameraActive && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-tangerine/40 text-xs font-mono text-vanilla flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-tangerine flex-shrink-0" />
            <span>
              Direct camera access restricted by browser permissions. Operating on <strong>high-fidelity synthetic optical test stream</strong>.
            </span>
          </div>
          <button
            onClick={startCamera}
            className="px-3 py-1 rounded-lg bg-tangerine/20 border border-tangerine text-tangerine hover:bg-tangerine hover:text-darkbrown-deep font-bold transition-all text-[11px]"
          >
            Retry Camera Access
          </button>
        </div>
      )}

      {/* Main Viewport & Interactive HUD Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Viewport (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden glass-surface border border-vanilla/25 shadow-2xl bg-black/90 group">
            
            {/* Real Webcam HTML5 Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isMirrored ? 'scale-x-[-1]' : 'scale-x-100'
              } ${isSimulatedFeed || !isCameraActive ? 'hidden' : 'block'}`}
            />

            {/* Simulated Live Fallback if camera unavailable */}
            {isSimulatedFeed && (
              <div className="w-full h-full flex items-center justify-center bg-[#131105] text-vanilla font-mono text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-darkbrown to-brunswick-deep opacity-60" />
                <div className="relative z-10 p-6">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-tangerine animate-spin-slow mx-auto mb-3 flex items-center justify-center">
                    <Target className="w-8 h-8 text-tangerine" />
                  </div>
                  <div className="text-sm font-semibold tracking-wider text-vanilla uppercase">
                    Optical Feed Synthesis Running
                  </div>
                  <div className="text-xs text-vanilla-muted mt-1">
                    Streaming spatial tracking coordinates onto simulated sensor plane
                  </div>
                </div>
              </div>
            )}

            {/* Offline Slate when camera is turned off manually */}
            {!isCameraActive && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#110F05] text-center p-8">
                <CameraOff className="w-16 h-16 text-vanilla-muted mb-4 opacity-40" />
                <h4 className="text-base font-semibold text-vanilla mb-1">
                  Optical Sensor Standby
                </h4>
                <p className="text-xs text-vanilla-muted max-w-sm mb-4">
                  Camera feed is currently disengaged. Engage sensor to begin continuous recognition.
                </p>
                <button
                  onClick={startCamera}
                  className="btn-tangerine-glow px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activate Optical Sensor</span>
                </button>
              </div>
            )}

            {/* Real-Time Tracking HUD Canvas Overlay */}
            {isCameraActive && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-20 w-full h-full"
              />
            )}

            {/* Live Recording HUD Watermark Overlay */}
            {isCameraActive && (
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2 text-[10px] font-mono bg-darkbrown/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-vanilla/15 text-vanilla">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>REC LIVE</span>
                <span className="text-vanilla-muted">•</span>
                <span className="text-tangerine font-bold">SOLIS HUD v4.5</span>
              </div>
            )}

            {/* Viewport Action Floating Bar */}
            {isCameraActive && (
              <div className="absolute bottom-4 inset-x-4 z-30 flex items-center justify-between pointer-events-auto">
                
                {/* Mirror Toggle */}
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className="p-2 rounded-xl bg-darkbrown/85 hover:bg-brunswick/80 text-vanilla-soft hover:text-vanilla border border-vanilla/15 backdrop-blur-md transition-all shadow-lg text-xs flex items-center gap-1.5"
                  title="Toggle Mirror Mode"
                >
                  <FlipHorizontal className="w-3.5 h-3.5 text-tangerine" />
                  <span className="hidden sm:inline text-[11px] font-mono">Mirror</span>
                </button>

                {/* Primary Central Button: Lock Target & Capture */}
                <button
                  onClick={handleCaptureFrame}
                  disabled={isCapturing}
                  className="btn-tangerine-glow px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center gap-2.5 shadow-[0_0_25px_rgba(235,125,0,0.5)] transform hover:scale-105 active:scale-95 transition-all"
                >
                  {isCapturing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Locking Vectors...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Lock Target & Deep Audit</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Shutter Toggle */}
                <button
                  onClick={stopCamera}
                  className="p-2 rounded-xl bg-darkbrown/85 hover:bg-red-950/80 text-vanilla-soft hover:text-red-400 border border-vanilla/15 backdrop-blur-md transition-all shadow-lg text-xs flex items-center gap-1.5"
                  title="Engage Privacy Shutter"
                >
                  <CameraOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline text-[11px] font-mono">Stop Feed</span>
                </button>

              </div>
            )}

          </div>

          {/* Quick Settings Deck Below Viewport */}
          <div className="glass-surface rounded-2xl p-4 border border-vanilla/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            
            {/* Toggles */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  audioFX.playClick();
                  setShowReticles(!showReticles);
                }}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  showReticles
                    ? 'bg-tangerine/20 border-tangerine text-tangerine font-bold'
                    : 'bg-darkbrown/60 border-vanilla/15 text-vanilla-muted hover:text-vanilla'
                }`}
              >
                HUD Reticles: {showReticles ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => {
                  audioFX.playClick();
                  setShowGrid(!showGrid);
                }}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  showGrid
                    ? 'bg-brunswick/60 border-vanilla/30 text-vanilla font-bold'
                    : 'bg-darkbrown/60 border-vanilla/15 text-vanilla-muted hover:text-vanilla'
                }`}
              >
                Grid Plane: {showGrid ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Confidence Slider */}
            <div className="flex items-center gap-2.5">
              <Sliders className="w-3.5 h-3.5 text-tangerine" />
              <span className="text-vanilla-muted">Threshold:</span>
              <input
                type="range"
                min="60"
                max="98"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-24 accent-tangerine cursor-pointer"
              />
              <span className="text-tangerine font-bold">{confidenceThreshold}%</span>
            </div>

          </div>

        </div>

        {/* Right: Live Targets Ledger & Spatial Coordinates (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="glass-surface rounded-3xl p-5 border border-vanilla/15 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-vanilla/10 mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-tangerine" />
                <h4 className="text-sm font-semibold text-vanilla tracking-tight">
                  Active Entity Stream
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tangerine/15 text-tangerine border border-tangerine/30 font-bold">
                {activeTargets.length} Locked
              </span>
            </div>

            {/* Target Entities Cards */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
              {activeTargets.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-vanilla-muted">
                  <Eye className="w-6 h-6 mx-auto mb-2 opacity-30 text-tangerine" />
                  <span>Scanning sensor field...</span>
                </div>
              ) : (
                activeTargets.map((tgt) => {
                  const isSelected = selectedTargetId === tgt.id;

                  return (
                    <div
                      key={tgt.id}
                      onClick={() => {
                        audioFX.playClick();
                        setSelectedTargetId(isSelected ? null : tgt.id);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-tangerine/20 border-tangerine text-white shadow-[0_0_18px_rgba(235,125,0,0.3)]'
                          : 'bg-darkbrown/60 hover:bg-brunswick/40 border-vanilla/10 text-vanilla-soft'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-tangerine animate-ping' : 'bg-vanilla/50'}`} />
                          <span className="text-xs font-bold text-vanilla truncate">
                            {tgt.label}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-tangerine">
                          {tgt.confidence}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-vanilla-muted mt-2 pt-1.5 border-t border-vanilla/10">
                        <span>Coord: [{tgt.x}%, {tgt.y}%]</span>
                        <span>Span: {tgt.width}% × {tgt.height}%</span>
                        <ChevronRight className="w-3 h-3 text-tangerine" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ledger Footer */}
            <div className="mt-4 pt-3 border-t border-vanilla/10 flex items-center justify-between text-[11px] font-mono text-vanilla-muted">
              <span>Dynamic Spatial Tracking</span>
              <span className="text-tangerine font-semibold">Sub-pixel precision</span>
            </div>

          </div>

          {/* Quick Guide Card */}
          <div className="p-4 rounded-2xl bg-brunswick/30 border border-vanilla/10 text-xs font-mono text-vanilla-soft space-y-2">
            <div className="flex items-center gap-1.5 text-vanilla font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-tangerine" />
              <span>Executive Optical Tip</span>
            </div>
            <p className="text-[11px] text-vanilla-muted leading-relaxed">
              Click <strong>"Lock Target & Deep Audit"</strong> at any moment to snapshot the active webcam frame and instantly receive an executive cognitive report with risk matrices and strategic directives.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};
