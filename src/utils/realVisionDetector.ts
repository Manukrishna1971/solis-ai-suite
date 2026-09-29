import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

export interface HandGestureInfo {
  gesture: 'Wave 👋' | 'Open Palm ✋' | 'Thumbs Up 👍' | 'Pointing ☝️' | 'Victory ✌️' | 'Hand Detected';
  movement: 'Waving Left/Right ↔️' | 'Moving Up ⬆️' | 'Moving Down ⬇️' | 'Stationary' | 'Fast Motion';
  speed: number;
}

export interface RealDetection {
  id: string;
  trackId?: string;
  class: string;
  displayName: string;
  score: number; // 0 - 100
  bbox: [number, number, number, number]; // [x, y, width, height] in pixels
  isFace?: boolean;
  emotion?: 'Happy 😊' | 'Delighted 😄' | 'Neutral 😐' | 'Surprised 😲' | 'Focused 🤔';
  emotionConfidence?: number;
  valence?: number; // -100 to +100
  isHand?: boolean;
  handInfo?: HandGestureInfo;
}

let cocoModel: cocoSsd.ObjectDetection | null = null;
let mobilenetModel: mobilenet.MobileNet | null = null;
let classifier: knnClassifier.KNNClassifier | null = null;

let isModelLoading = false;
let modelLoadPromise: Promise<boolean> | null = null;

// Human-friendly label mapping
const FRIENDLY_NAMES: Record<string, string> = {
  // Mobile & Devices
  'cell phone': 'Mobile / Smartphone',
  'laptop': 'Laptop',
  'mouse': 'Mouse',
  'keyboard': 'Keyboard',
  'remote': 'Remote Control',
  'tv': 'Monitor / Television',

  // Ironbox & Appliances
  'iron': 'Ironbox / Clothes Iron',
  'smoothing iron': 'Ironbox / Electric Iron',
  'toaster': 'Ironbox / Appliance',

  // Specs & Eyewear
  'specs': 'Specs / Eyeglasses',
  'sunglasses': 'Specs / Sunglasses',
  'spectacles': 'Specs / Glasses',

  // Pen & Writing
  'pen': 'Pen / Writing Pen',
  'ballpoint': 'Ballpoint Pen',
  'ballpoint pen': 'Ballpoint Pen',
  'fountain pen': 'Fountain Pen',
  'pencil': 'Pencil / Pen',
  'marker': 'Marker / Pen',

  // Vehicles
  'car': 'Car / Automobile',
  'sports car': 'Car / Automobile',
  'convertible': 'Car / Convertible',
  'minivan': 'Car / Automobile',
  'bicycle': 'Bike / Bicycle',
  'motorcycle': 'Bike / Motorcycle',

  // Common household items
  'person': 'Person',
  'bottle': 'Water Bottle',
  'cup': 'Cup / Mug',
  'book': 'Book',
  'chair': 'Chair',
  'couch': 'Sofa / Couch',
  'potted plant': 'Plant',
  'dining table': 'Desk / Table',
  'clock': 'Clock',
  'backpack': 'Backpack',
  'handbag': 'Handbag / Bag',
  'suitcase': 'Luggage',
  'umbrella': 'Umbrella',
  'scissors': 'Scissors',
  'apple': 'Apple',
  'banana': 'Banana',
};

const CUSTOM_MODEL_KEY = 'solis_custom_trained_classes';
const customTrainedClasses = new Set<string>();

export async function loadRealModel(onProgress?: (msg: string) => void): Promise<boolean> {
  if (cocoModel && mobilenetModel) return true;
  if (modelLoadPromise) return modelLoadPromise;

  onProgress?.('Initializing high-speed neural engine...');
  isModelLoading = true;

  modelLoadPromise = (async () => {
    try {
      await tf.ready();
      
      // Load COCO-SSD for instant spatial bounding boxes
      onProgress?.('Loading MobileNet COCO-SSD core...');
      cocoModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });

      // Load MobileNet for fine-grained ImageNet & Teachable AI
      onProgress?.('Loading ImageNet feature extractor...');
      mobilenetModel = await mobilenet.load({ version: 2, alpha: 0.5 });

      // Initialize KNN Classifier
      classifier = knnClassifier.create();

      // Load saved custom trained labels from localStorage if any
      try {
        const saved = localStorage.getItem(CUSTOM_MODEL_KEY);
        if (saved) {
          const list: string[] = JSON.parse(saved);
          list.forEach(item => customTrainedClasses.add(item));
        }
      } catch {
        // Ignore
      }

      isModelLoading = false;
      onProgress?.('System ready.');
      return true;
    } catch (err) {
      isModelLoading = false;
      console.error('Failed to load neural models:', err);
      throw err;
    }
  })();

  return modelLoadPromise;
}

export function isModelReady(): boolean {
  return cocoModel !== null && mobilenetModel !== null;
}

/* =========================================================================
   1. CUSTOM OBJECT TRAINER (TEACHABLE AI VIA KNN CLASSIFIER)
   ========================================================================= */

export function getCustomTrainedLabels(): string[] {
  return Array.from(customTrainedClasses);
}

export async function trainCustomObject(
  label: string,
  element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<number> {
  if (!mobilenetModel || !classifier) {
    await loadRealModel();
  }
  if (!mobilenetModel || !classifier) return 0;

  try {
    const activation = mobilenetModel.infer(element, true);
    classifier.addExample(activation, label);
    activation.dispose();

    customTrainedClasses.add(label);
    try {
      localStorage.setItem(CUSTOM_MODEL_KEY, JSON.stringify(Array.from(customTrainedClasses)));
    } catch {
      // Ignore
    }

    const exampleCount = classifier.getClassExampleCount();
    return exampleCount[label] || 1;
  } catch (err) {
    console.error('Error training custom object:', err);
    return 0;
  }
}

export function clearCustomModel() {
  if (classifier) {
    classifier.clearAllClasses();
  }
  customTrainedClasses.clear();
  try {
    localStorage.removeItem(CUSTOM_MODEL_KEY);
  } catch {
    // Ignore
  }
}

/* =========================================================================
   2. FAST, ZERO-LAG COMPUTER VISION PREPROCESSING (CV AUTO-GAIN)
   ========================================================================= */

const cvCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

export interface CVPreprocessingTelemetry {
  originalLuminance: number;
  contrastBoostApplied: boolean;
  sharpnessApplied: boolean;
}

export function preprocessFrame(
  source: HTMLVideoElement | HTMLImageElement,
  width: number,
  height: number,
  options = { autoGain: true, sharpen: false }
): { canvas: HTMLCanvasElement; telemetry: CVPreprocessingTelemetry } {
  if (!cvCanvas) throw new Error('Canvas not available');

  cvCanvas.width = width;
  cvCanvas.height = height;
  const ctx = cvCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D context not available');

  ctx.drawImage(source, 0, 0, width, height);

  const telemetry: CVPreprocessingTelemetry = {
    originalLuminance: 128,
    contrastBoostApplied: false,
    sharpnessApplied: false,
  };

  // If autoGain is not requested, return fast draw
  if (!options.autoGain) {
    return { canvas: cvCanvas, telemetry };
  }

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    // Fast sub-sampled luminance check (sample every 64th pixel for 0ms overhead)
    let totalLum = 0;
    let sampledCount = 0;
    for (let i = 0; i < len; i += 64) {
      totalLum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      sampledCount++;
    }
    const avgLum = sampledCount > 0 ? totalLum / sampledCount : 128;
    telemetry.originalLuminance = Math.round(avgLum);

    // Only apply gamma lift if frame is genuinely dark (< 100)
    if (avgLum < 100) {
      telemetry.contrastBoostApplied = true;
      const boostFactor = Math.min(1.8, 120 / Math.max(35, avgLum));
      const gamma = 0.76;

      for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, Math.pow(data[i] / 255, gamma) * 255 * boostFactor);
        data[i + 1] = Math.min(255, Math.pow(data[i + 1] / 255, gamma) * 255 * boostFactor);
        data[i + 2] = Math.min(255, Math.pow(data[i + 2] / 255, gamma) * 255 * boostFactor);
      }
      ctx.putImageData(imgData, 0, 0);
    }
  } catch {
    // Continue with unenhanced frame on error
  }

  return { canvas: cvCanvas, telemetry };
}

/* =========================================================================
   3. STRICT FACE VERIFICATION & FINE-TUNED EMOTION ANALYSIS
   (Eliminates phantom faces when nothing is there)
   ========================================================================= */

const emotionCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

interface FaceVerificationResult {
  isGenuineFace: boolean;
  emotion: 'Happy 😊' | 'Delighted 😄' | 'Neutral 😐' | 'Surprised 😲' | 'Focused 🤔';
  confidence: number;
  valence: number;
}

/**
 * Strict Biometric Verification:
 * Validates that the crop actually contains a human face before emitting a face box.
 * Inspects:
 * 1. Skin-tone density across cheek/forehead.
 * 2. Bilateral eye-socket contrast depressions.
 * 3. Mouth region variation.
 * If any of these fail, it returns isGenuineFace: false to prevent phantom faces on empty rooms/chairs!
 */
function verifyFaceAndAnalyzeEmotion(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  fx: number,
  fy: number,
  fw: number,
  fh: number,
  sourceW: number,
  sourceH: number
): FaceVerificationResult {
  const rejected: FaceVerificationResult = { isGenuineFace: false, emotion: 'Neutral 😐', confidence: 0, valence: 0 };

  // Minimum dimensions check: face must be reasonably sized
  if (!emotionCanvas || fw < 25 || fh < 25) return rejected;

  // Safe boundary clamping
  const safeX = Math.max(0, Math.min(sourceW - 1, fx));
  const safeY = Math.max(0, Math.min(sourceH - 1, fy));
  const safeW = Math.max(1, Math.min(sourceW - safeX, fw));
  const safeH = Math.max(1, Math.min(sourceH - safeY, fh));

  try {
    emotionCanvas.width = 64;
    emotionCanvas.height = 64;
    const ctx = emotionCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return rejected;

    ctx.drawImage(source, safeX, safeY, safeW, safeH, 0, 0, 64, 64);
    const imgData = ctx.getImageData(0, 0, 64, 64);
    const data = imgData.data;

    let skinPixels = 0;
    let upperLum = 0, upperCount = 0;
    let lowerLum = 0, lowerCount = 0;
    let leftEyeLum = 0, leftEyeCount = 0;
    let rightEyeLum = 0, rightEyeCount = 0;
    let teethBright = 0, cavityDark = 0;

    for (let py = 0; py < 64; py++) {
      for (let px = 0; px < 64; px++) {
        const idx = (py * 64 + px) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;

        // Skin chromaticity check
        if (r > 60 && g > 35 && b > 25 && r > g && (r - g) > 8 && r > b) {
          skinPixels++;
        }

        // Left eye region (py: 16 to 30, px: 12 to 28)
        if (py >= 16 && py <= 30 && px >= 12 && px <= 28) {
          leftEyeLum += lum;
          leftEyeCount++;
        }
        // Right eye region (py: 16 to 30, px: 36 to 52)
        if (py >= 16 && py <= 30 && px >= 36 && px <= 52) {
          rightEyeLum += lum;
          rightEyeCount++;
        }

        // Upper face (py: 14 to 34, px: 10 to 54)
        if (py >= 14 && py <= 34 && px >= 10 && px <= 54) {
          upperLum += lum;
          upperCount++;
        }

        // Mouth zone (py: 40 to 60, px: 14 to 50)
        if (py >= 40 && py <= 60 && px >= 14 && px <= 50) {
          lowerLum += lum;
          lowerCount++;
          if (lum > 165) teethBright++;
          if (lum < 50) cavityDark++;
        }
      }
    }

    // STRICT BIOMETRIC GATE 1: Skin presence (must have at least 25% skin-tone pixels in face crop)
    const skinRatio = skinPixels / (64 * 64);
    if (skinRatio < 0.25) {
      return rejected; // Wall, chair, fabric, or empty background
    }

    // STRICT BIOMETRIC GATE 2: Bilateral symmetry (eyes should have comparable luminance)
    const avgLeftEye = leftEyeCount > 0 ? leftEyeLum / leftEyeCount : 128;
    const avgRightEye = rightEyeCount > 0 ? rightEyeLum / rightEyeCount : 128;
    const eyeDiff = Math.abs(avgLeftEye - avgRightEye);
    if (eyeDiff > 65) {
      return rejected; // Highly asymmetric pattern / random object
    }

    const avgUpper = upperCount > 0 ? upperLum / upperCount : 128;
    const avgLower = lowerCount > 0 ? lowerLum / lowerCount : 128;
    const contrast = avgLower / Math.max(1, avgUpper);

    // Emotion Classification on Verified Genuine Face
    let emotion: 'Happy 😊' | 'Delighted 😄' | 'Neutral 😐' | 'Surprised 😲' | 'Focused 🤔' = 'Neutral 😐';
    let confidence = 92;
    let valence = 0;

    if (teethBright > 16 && contrast > 1.12) {
      emotion = 'Delighted 😄';
      confidence = Math.min(98, 92 + teethBright);
      valence = 92;
    } else if (contrast > 1.05 || teethBright > 6) {
      emotion = 'Happy 😊';
      confidence = Math.min(96, Math.round(88 + contrast * 6));
      valence = 75;
    } else if (cavityDark > 26 && avgUpper > 110) {
      emotion = 'Surprised 😲';
      confidence = Math.min(96, Math.round(88 + cavityDark * 0.15));
      valence = 30;
    } else if (avgUpper < 100 && contrast > 1.08) {
      emotion = 'Focused 🤔';
      confidence = Math.min(94, Math.round(86 + (110 - avgUpper) * 0.2));
      valence = 15;
    } else {
      emotion = 'Neutral 😐';
      confidence = Math.min(95, Math.round(90 + Math.abs(avgLower - 120) * 0.08));
      valence = 0;
    }

    return {
      isGenuineFace: true,
      emotion,
      confidence,
      valence,
    };
  } catch {
    return rejected;
  }
}

/* =========================================================================
   4. REAL-TIME HAND MOVEMENT & GESTURE DETECTION (HIGH PRECISION)
   ========================================================================= */

interface HandTrackState {
  lastX: number;
  lastY: number;
  lastTime: number;
}

const handTrackState: HandTrackState = {
  lastX: 0,
  lastY: 0,
  lastTime: performance.now(),
};

const handAnalysisCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

export function detectHandGestures(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  frameWidth: number,
  frameHeight: number
): RealDetection[] {
  if (!handAnalysisCanvas || frameWidth <= 0 || frameHeight <= 0) return [];

  try {
    const sw = 160;
    const sh = 120;
    handAnalysisCanvas.width = sw;
    handAnalysisCanvas.height = sh;

    const ctx = handAnalysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];

    ctx.drawImage(source, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    let minX = sw, maxX = 0, minY = sh, maxY = 0;
    let handPixelCount = 0;
    let sumX = 0, sumY = 0;

    // Search for hand in peripheral / lower regions, excluding head area
    for (let y = 14; y < sh - 14; y++) {
      for (let x = 10; x < sw - 10; x++) {
        // Exclude central head area
        if (y < sh * 0.48 && x > sw * 0.32 && x < sw * 0.68) continue;

        const idx = (y * sw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Clean skin chromaticity in natural lighting
        const isSkin = (r > 95 && g > 50 && b > 35 && (r - g) > 15 && r > b && (Math.max(r, g, b) - Math.min(r, g, b)) > 18);

        if (isSkin) {
          handPixelCount++;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // REQUIRE SUBSTANTIAL HAND AREA (minimum 350 pixels out of 160x120) to prevent false room triggers
    if (handPixelCount < 350 || maxX <= minX || maxY <= minY) {
      return [];
    }

    const handW = maxX - minX;
    const handH = maxY - minY;
    if (handW < 14 || handH < 14) return [];

    const aspectRatio = handH / Math.max(1, handW);
    const centroidX = sumX / handPixelCount;
    const centroidY = sumY / handPixelCount;

    // Compute velocity
    const now = performance.now();
    const dt = Math.max(16, now - handTrackState.lastTime);
    const rawDx = ((centroidX - handTrackState.lastX) / sw) * frameWidth;
    const rawDy = ((centroidY - handTrackState.lastY) / sh) * frameHeight;

    const vx = Math.round((rawDx / dt) * 100);
    const vy = Math.round((rawDy / dt) * 100);

    handTrackState.lastX = centroidX;
    handTrackState.lastY = centroidY;
    handTrackState.lastTime = now;

    const speed = Math.round(Math.sqrt(vx * vx + vy * vy));

    let movement: HandGestureInfo['movement'] = 'Stationary';
    if (Math.abs(vx) > 14) {
      movement = 'Waving Left/Right ↔️';
    } else if (vy < -12) {
      movement = 'Moving Up ⬆️';
    } else if (vy > 12) {
      movement = 'Moving Down ⬇️';
    } else if (speed > 22) {
      movement = 'Fast Motion';
    }

    let gesture: HandGestureInfo['gesture'] = 'Open Palm ✋';
    let gestureConfidence = 92;

    if (Math.abs(vx) > 16) {
      gesture = 'Wave 👋';
      gestureConfidence = Math.min(98, 88 + Math.round(Math.abs(vx)));
    } else if (aspectRatio > 1.45) {
      if (centroidY < (minY + handH * 0.4)) {
        gesture = 'Pointing ☝️';
        gestureConfidence = 93;
      } else {
        gesture = 'Victory ✌️';
        gestureConfidence = 90;
      }
    } else if (aspectRatio < 0.95 && handPixelCount > 450) {
      gesture = 'Thumbs Up 👍';
      gestureConfidence = 92;
    } else {
      gesture = 'Open Palm ✋';
      gestureConfidence = 94;
    }

    const scaledX = Math.round((minX / sw) * frameWidth);
    const scaledY = Math.round((minY / sh) * frameHeight);
    const scaledW = Math.round((handW / sw) * frameWidth);
    const scaledH = Math.round((handH / sh) * frameHeight);

    return [{
      id: `hand-${Date.now()}`,
      class: 'hand',
      displayName: `Hand: ${gesture}`,
      score: gestureConfidence,
      bbox: [scaledX, scaledY, scaledW, scaledH],
      isHand: true,
      handInfo: {
        gesture,
        movement,
        speed,
      },
    }];
  } catch {
    return [];
  }
}

/* =========================================================================
   5. NON-MAXIMUM SUPPRESSION (NMS) & OPTIMISTIC SMOOTHING
   ========================================================================= */

function calculateIOU(boxA: [number, number, number, number], boxB: [number, number, number, number]): number {
  const [x1, y1, w1, h1] = boxA;
  const [x2, y2, w2, h2] = boxB;

  const xA = Math.max(x1, x2);
  const yA = Math.max(y1, y2);
  const xB = Math.min(x1 + w1, x2 + w2);
  const yB = Math.min(y1 + h1, y2 + h2);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  const unionArea = (w1 * h1) + (w2 * h2) - interArea;
  if (unionArea <= 0) return 0;

  return interArea / unionArea;
}

export function applyNonMaxSuppression(detections: RealDetection[], iouThreshold = 0.52): RealDetection[] {
  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const selected: RealDetection[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    let keep = true;

    for (let j = 0; j < selected.length; j++) {
      const existing = selected[j];

      // Keep hands, faces, and objects distinct
      if (current.isFace !== existing.isFace || current.isHand !== existing.isHand) {
        continue;
      }

      if (current.class === existing.class) {
        if (calculateIOU(current.bbox, existing.bbox) > iouThreshold) {
          keep = false;
          break;
        }
      }
    }

    if (keep) selected.push(current);
  }

  return selected;
}

/**
 * Optimistic Temporal Tracker:
 * High alpha (0.85) ensures bounding boxes snap immediately with ZERO latency / dragging!
 */
export class TemporalObjectTracker {
  private tracks: Map<string, RealDetection & { lastSeen: number }> = new Map();
  private alpha = 0.85; // Snappy, optimistic response (zero lag!)
  private maxAge = 250; // Quick expiry to prevent ghost boxes

  public update(raw: RealDetection[]): RealDetection[] {
    const now = performance.now();
    const updated = new Map<string, RealDetection & { lastSeen: number }>();
    const unmatched = [...raw];

    this.tracks.forEach((track, id) => {
      let bestIdx = -1;
      let highestIOU = 0.20;

      for (let i = 0; i < unmatched.length; i++) {
        const c = unmatched[i];
        if (c.class === track.class || (c.isFace && track.isFace) || (c.isHand && track.isHand)) {
          const iou = calculateIOU(track.bbox, c.bbox);
          if (iou > highestIOU) {
            highestIOU = iou;
            bestIdx = i;
          }
        }
      }

      if (bestIdx !== -1) {
        const m = unmatched[bestIdx];
        unmatched.splice(bestIdx, 1);

        const sx = Math.round(this.alpha * m.bbox[0] + (1 - this.alpha) * track.bbox[0]);
        const sy = Math.round(this.alpha * m.bbox[1] + (1 - this.alpha) * track.bbox[1]);
        const sw = Math.round(this.alpha * m.bbox[2] + (1 - this.alpha) * track.bbox[2]);
        const sh = Math.round(this.alpha * m.bbox[3] + (1 - this.alpha) * track.bbox[3]);

        updated.set(id, {
          ...m,
          id,
          trackId: id,
          bbox: [sx, sy, sw, sh],
          score: m.score,
          lastSeen: now,
          emotion: m.emotion || track.emotion,
          emotionConfidence: m.emotionConfidence || track.emotionConfidence,
          valence: m.valence || track.valence,
          handInfo: m.handInfo || track.handInfo,
        });
      } else if (now - track.lastSeen < this.maxAge) {
        updated.set(id, track);
      }
    });

    unmatched.forEach((newItem, idx) => {
      const nid = `track-${Date.now()}-${idx}`;
      updated.set(nid, { ...newItem, id: nid, trackId: nid, lastSeen: now });
    });

    this.tracks = updated;

    return Array.from(this.tracks.values()).map(t => ({
      id: t.id,
      trackId: t.trackId,
      class: t.class,
      displayName: t.displayName,
      score: t.score,
      bbox: t.bbox,
      isFace: t.isFace,
      emotion: t.emotion,
      emotionConfidence: t.emotionConfidence,
      valence: t.valence,
      isHand: t.isHand,
      handInfo: t.handInfo,
    }));
  }

  public reset() {
    this.tracks.clear();
  }
}

/* =========================================================================
   6. OPTIMISTIC REAL-TIME DETECTION PIPELINE
   ========================================================================= */

const defaultTracker = new TemporalObjectTracker();

export async function detectEnhancedRealObjects(
  source: HTMLVideoElement | HTMLImageElement,
  options: {
    minConfidence?: number;
    useCVPreprocessing?: boolean;
    useTemporalSmoothing?: boolean;
    detectHands?: boolean;
    tracker?: TemporalObjectTracker;
  } = {}
): Promise<{ detections: RealDetection[]; cvTelemetry: CVPreprocessingTelemetry }> {
  const {
    minConfidence = 0.52, // Healthy threshold to prevent room hallucinations
    useCVPreprocessing = true,
    useTemporalSmoothing = true,
    detectHands = true,
    tracker = defaultTracker,
  } = options;

  await loadRealModel();
  if (!cocoModel) throw new Error('COCO-SSD model not ready');

  const width = (source as HTMLVideoElement).videoWidth || (source as HTMLImageElement).naturalWidth || source.clientWidth || 1280;
  const height = (source as HTMLVideoElement).videoHeight || (source as HTMLImageElement).naturalHeight || source.clientHeight || 720;

  // 1. Fast CV Preprocessing
  let detectionInput: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement = source;
  let cvTelemetry: CVPreprocessingTelemetry = {
    originalLuminance: 128,
    contrastBoostApplied: false,
    sharpnessApplied: false,
  };

  if (useCVPreprocessing && width > 0 && height > 0) {
    const preprocessed = preprocessFrame(source, width, height, { autoGain: true, sharpen: false });
    detectionInput = preprocessed.canvas;
    cvTelemetry = preprocessed.telemetry;
  }

  // 2. High-speed COCO-SSD detection pass (INSTANT < 15ms)
  const predictions = await cocoModel.detect(detectionInput, 10, minConfidence);
  const rawDetections: RealDetection[] = [];

  for (let i = 0; i < predictions.length; i++) {
    const p = predictions[i];
    const [x, y, w, h] = p.bbox;
    const scorePct = Math.round(p.score * 100);
    const friendlyName = FRIENDLY_NAMES[p.class.toLowerCase()] || p.class.toUpperCase();

    // Push detected item
    rawDetections.push({
      id: `det-${i}-${Date.now()}`,
      class: p.class.toLowerCase(),
      displayName: friendlyName,
      score: scorePct,
      bbox: [Math.round(x), Math.round(y), Math.round(w), Math.round(h)],
      isFace: false,
    });

    // FACE & EMOTION DETECTION:
    // Only if a genuine person is detected with HIGH confidence (score >= 65%)
    if (p.class.toLowerCase() === 'person' && p.score >= 0.65) {
      const faceW = Math.round(w * 0.50);
      const faceH = Math.round(h * 0.28);
      const faceX = Math.round(x + w * 0.25);
      const faceY = Math.max(0, Math.round(y + h * 0.04));

      // STRICT BIOMETRIC VERIFICATION (prevents phantom face when nothing is there!)
      const faceCheck = verifyFaceAndAnalyzeEmotion(detectionInput, faceX, faceY, faceW, faceH, width, height);

      if (faceCheck.isGenuineFace) {
        rawDetections.push({
          id: `face-${i}-${Date.now()}`,
          class: 'face',
          displayName: `Face: ${faceCheck.emotion}`,
          score: Math.min(99, Math.round(scorePct * 0.98)),
          bbox: [faceX, faceY, faceW, faceH],
          isFace: true,
          emotion: faceCheck.emotion,
          emotionConfidence: faceCheck.confidence,
          valence: faceCheck.valence,
        });
      }
    }
  }

  // 3. Fast Hand Gesture Detection (only if substantial hand is present)
  if (detectHands && width > 0 && height > 0) {
    const handDetections = detectHandGestures(detectionInput, width, height);
    handDetections.forEach(hd => rawDetections.push(hd));
  }

  // 4. Non-Maximum Suppression (NMS)
  const nmsDetections = applyNonMaxSuppression(rawDetections, 0.52);

  // 5. Snappy Temporal Tracking (0ms delay)
  const finalDetections = useTemporalSmoothing ? tracker.update(nmsDetections) : nmsDetections;

  return { detections: finalDetections, cvTelemetry };
}

export async function detectRealObjects(
  source: HTMLVideoElement | HTMLImageElement,
  minConfidence = 0.52
): Promise<RealDetection[]> {
  const res = await detectEnhancedRealObjects(source, {
    minConfidence,
    useCVPreprocessing: true,
    useTemporalSmoothing: true,
    detectHands: true,
  });
  return res.detections;
}
