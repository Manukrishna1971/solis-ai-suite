export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  urgent: number;
  constructive: number;
  overallTone: 'Optimistic & Strategic' | 'Cautious & Analytical' | 'Urgent & Critical' | 'Balanced & Methodical';
  emotionalTemperature: number; // 0 to 100
  dominantKeywords: { word: string; category: 'positive' | 'risk' | 'neutral' | 'action' }[];
}

export interface MetricDimension {
  label: string;
  score: number; // 0 - 100
  benchmark: string;
  description: string;
}

export interface KeyInsight {
  id: string;
  category: 'Strategic Advantage' | 'Critical Risk' | 'Executive Observation' | 'Operational Factor';
  title: string;
  detail: string;
  impactLevel: 'High' | 'Medium' | 'Critical';
  confidence: number; // 0 - 100
}

export interface ActionableSuggestion {
  id: string;
  title: string;
  originalSnippet?: string;
  improvedVersion: string;
  rationale: string;
  expectedGain: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface AnalysisResult {
  id: string;
  title: string;
  rawInput: string;
  sourceType: 'text' | 'file' | 'preset';
  timestamp: string;
  compositeScore: number; // 0 - 100
  tierGrade: string; // e.g. "Tier A+ • Dominant Position"
  summaryHeadline: string;
  summaryParagraph: string;
  metrics: MetricDimension[];
  sentiment: SentimentBreakdown;
  insights: KeyInsight[];
  suggestions: ActionableSuggestion[];
  tokensProcessed: number;
  processingTimeMs: number;
}

export interface PresetScenario {
  id: string;
  name: string;
  category: string;
  badge: string;
  preview: string;
  fullText: string;
}

/* =========================================
   Neural Vision & Object Detection Models
   ========================================= */

export interface BoundingBox {
  x: number;      // percentage 0 - 100
  y: number;      // percentage 0 - 100
  width: number;  // percentage 0 - 100
  height: number; // percentage 0 - 100
}

export interface DetectedObject {
  id: string;
  label: string;
  category: 'Personnel' | 'Autonomous Systems' | 'Compute & Tech' | 'Infrastructure' | 'Vehicle';
  confidence: number; // percentage e.g. 97.4
  bbox: BoundingBox;
  threatLevel: 'Nominal' | 'Monitored' | 'Priority Attention';
  description: string;
  dimensionsEstimate?: string;
}

export interface VisionCategoryCount {
  category: DetectedObject['category'];
  count: number;
  percentage: number;
  color: string;
}

export interface VisionAnalysisResult {
  id: string;
  imageSrc: string;
  imageName: string;
  sourceType: 'upload' | 'preset';
  timestamp: string;
  dimensions: { width: number; height: number };
  totalObjects: number;
  opticalIntegrityScore: number; // 0 - 100
  overallSceneClassification: string;
  sceneSummary: string;
  categories: VisionCategoryCount[];
  objects: DetectedObject[];
  processingTimeMs: number;
}

export interface VisionPreset {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  imageUrl: string;
  preconfiguredObjects: DetectedObject[];
}
