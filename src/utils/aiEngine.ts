import { AnalysisResult, PresetScenario, MetricDimension, KeyInsight, ActionableSuggestion, SentimentBreakdown } from '../types';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'series-a-deck',
    name: 'Series A Venture Pitch',
    category: 'Venture Capital',
    badge: 'High Traction',
    preview: 'Autonomous AI agents orchestrating supply chain logistics with 340% YoY ARR growth...',
    fullText: `Company: Nexus Neural Inc. — Confidential Investment Briefing
Target Round: $18.5M Series A | Lead Valuation: $85M Post

Executive Summary:
Nexus Neural is pioneering zero-latency autonomous micro-agent swarms designed to automate global tier-1 supply routing. Over the last 14 months, our annual recurring revenue expanded from $850k to $3.74M (340% YoY) with net revenue retention holding at 148%. Our proprietary causal-graph inference model reduces unexpected dispatch delays by 41.8% across 18 Fortune 500 manufacturing partners.

Defensible Moat:
Unlike superficial wrappers around generic LLMs, Nexus operates a localized edge runtime that adheres to SOC2 Type II, ISO 27001, and ITAR compliance standards without shipping enterprise telemetry off-premises. Customer lifetime value to CAC ratio stands at 7.2x with an average 4-month payback window.

Identified Scale Risks:
1. Enterprise pilot expansion requires dedicated integration engineering in legacy ERP environments (SAP S/4HANA & Oracle Cloud).
2. Hardware acceleration cluster constraints during peak freight quarters require strategic GPU reservation agreements.

Capital Allocation:
60% Advanced R&D and proprietary model quantization; 25% Go-to-Market enterprise sales expansion across EMEA and APAC; 15% Regulatory compliance and liquidity buffer.`
  },
  {
    id: 'customer-crisis',
    name: 'Customer Crisis Escalation',
    category: 'Incident Response',
    badge: 'Urgent Priority',
    preview: 'Severity 1 database failover triggered during market open; latency spiked to 4.2s...',
    fullText: `INCIDENT POST-MORTEM & EXECUTIVE ESCALATION BRIEF
Incident ID: INC-88291-ALPHA | Severity: Tier-1 Mission Critical
Impacted Services: Core Clearing & Settlement Ledger | Customer: Horizon Global Asset Mgmt

Incident Timeline:
At 09:31:04 EST, during market opening order surges, our primary CockroachDB shard cluster experienced unrecoverable lock contention exacerbated by an automated garbage collection sweep. Transaction commit latency spiked from 14ms to 4,280ms, impacting approximately 28,400 trade settlement dispatches.

Corrective Measures Implemented:
- Traffic redirected to secondary warm standby replica at 09:44:12 EST. Full system recovery achieved at 09:51:30 EST. Total duration: 20 minutes, 26 seconds.
- Memory thresholds elevated to 90% allocation buffer; auto-sweep throttles modified to off-peak hours only.

Customer Trust Remediation:
We acknowledge that Horizon suffered unacceptable SLA degradation during prime market hours. We are executing a 100% credit on monthly platform infrastructure fees ($145,000 credit) and deploying two dedicated site reliability engineers directly embedded with Horizon's technical team for the next 90 days. Zero data corruption or ledger desynchronization occurred.`
  },
  {
    id: 'product-prd',
    name: 'Autonomous AI Roadmap PRD',
    category: 'Product Strategy',
    badge: 'Innovation',
    preview: 'PRD: Project Solis Quantum — Multi-modal ambient agent runtime with sub-10ms response...',
    fullText: `Product Requirements Document: Project Solis Quantum
Author: Principal Product Architect | Status: Approved for Q3 Engineering
Target Audience: Enterprise Data Science Teams & Autonomous Operations

Objective:
Deliver a self-optimizing multi-modal cognitive agent framework that ingests continuous multi-source data streams (voice, structured databases, real-time sensor telematics) and performs automated root-cause arbitration without human triage.

Key Capabilities:
1. Real-time Causal Inference Engine: Sub-12ms inference latency using quantized weights running in WebAssembly and edge CUDA kernels.
2. Self-Healing Schema Adapters: Automatically adjusts to upstream API contract breaks without crashing downstream pipelines.
3. Natural Governance Layer: Real-time sentiment and policy enforcement auditing all outgoing agent communications before execution.

Success Metrics:
- 70% decrease in manual telemetry triage across customer operations teams.
- 99.999% uptime for continuous streaming agent arbitrations.
- Sub-50ms round-trip latency at p99 under 500k concurrent active agent swarms.`
  },
  {
    id: 'financial-memo',
    name: 'Global Margin Optimization Memo',
    category: 'Executive Finance',
    badge: 'High Impact',
    preview: 'Q3 Financial Strategy: Unlocking 420 bps of gross margin through AI-driven routing...',
    fullText: `CONFIDENTIAL STRATEGY MEMORANDUM
To: Board of Directors & Chief Executive Officer
From: Office of the Chief Financial Officer
Subject: Global Operating Margin Optimization & Capex Realignment

Executive Thesis:
By consolidating decentralized cloud procurement and substituting tier-3 vendor subscriptions with an unified internal autonomous intelligence layer, the firm will capture 420 basis points of gross margin expansion ($42.8M annualized run-rate) within 3 fiscal quarters.

Key Pillars of Realization:
1. Cloud Compute Restructuring: Transitioning from on-demand cloud GPU leasing to multi-year committed-use reservation contracts, capturing an immediate 31% discount on baseline model serving.
2. Vendor Rationalization: Eliminating 14 fragmented analytics and telemetry point solutions in favor of a consolidated Solis Intelligence fabric, eliminating $18.4M in recurring SaaS licensing fees.
3. Operating Leverage: Shifting customer onboarding automation from high-touch professional services to autonomous digital twins, compressing customer time-to-value from 42 days to 6 days.

Risk Matrix & Sensitivity:
- Capex upfront requirement: $9.2M in Q4 infrastructure capital.
- Payback timeline: 4.8 months at current baseline adoption trajectory.`
  }
];

export function analyzeContent(inputText: string, sourceType: 'text' | 'file' | 'preset' = 'text'): AnalysisResult {
  const text = inputText.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = text.toLowerCase();

  // Lexical & Sentiment Analysis
  const positiveWords = ['growth', 'profit', 'expansion', 'accelerate', 'proprietary', 'retention', 'revenue', 'advantage', 'success', 'optimiz', 'recover', 'lead', 'pioneer', 'strong', 'excellent', 'gain', 'surpassed', 'achieved'];
  const riskWords = ['risk', 'contention', 'spike', 'latency', 'delay', 'incident', 'degrad', 'impact', 'loss', 'fail', 'concern', 'vulnerab', 'threat', 'constraint', 'cost', 'bottleneck'];
  const urgentWords = ['urgent', 'critical', 'immediate', 'escalation', 'outage', 'sla', 'priority', 'asap', 'timeline', 'emergency', 'now', 'severe'];
  const constructiveWords = ['remediation', 'strategy', 'architecture', 'solution', 'roadmap', 'objective', 'measure', 'allocation', 'consolidation', 'audit', 'governance', 'framework'];

  let posCount = 0;
  let riskCount = 0;
  let urgentCount = 0;
  let constCount = 0;

  positiveWords.forEach(w => { if (lower.includes(w)) posCount += 2; });
  riskWords.forEach(w => { if (lower.includes(w)) riskCount += 2; });
  urgentWords.forEach(w => { if (lower.includes(w)) urgentCount += 2.5; });
  constructiveWords.forEach(w => { if (lower.includes(w)) constCount += 1.8; });

  const totalHits = Math.max(1, posCount + riskCount + urgentCount + constCount);

  // Normalized percentages
  let positivePct = Math.round((posCount / totalHits) * 55) + 25;
  let urgentPct = Math.round((urgentCount / totalHits) * 40) + (urgentCount > 2 ? 15 : 5);
  let riskFactor = Math.round((riskCount / totalHits) * 35) + 10;
  let constructivePct = Math.round((constCount / totalHits) * 35) + 20;

  // Cap bounds
  positivePct = Math.min(94, Math.max(12, positivePct));
  urgentPct = Math.min(88, Math.max(8, urgentPct));
  constructivePct = Math.min(85, Math.max(15, constructivePct));
  const neutralPct = Math.max(8, 100 - (positivePct * 0.4 + urgentPct * 0.3 + constructivePct * 0.3));

  // Determine overall tone
  let overallTone: SentimentBreakdown['overallTone'] = 'Balanced & Methodical';
  if (urgentPct > 45 || riskFactor > 35) {
    overallTone = 'Urgent & Critical';
  } else if (positivePct > 60) {
    overallTone = 'Optimistic & Strategic';
  } else if (constructivePct > 50) {
    overallTone = 'Cautious & Analytical';
  }

  // Calculate composite score (0-100)
  const lengthBonus = Math.min(20, Math.floor(wordCount / 12));
  const clarityBase = Math.min(96, Math.max(58, 70 + (constructivePct > 30 ? 12 : 4) - (riskFactor > 30 ? 6 : 0)));
  const persuasionBase = Math.min(98, Math.max(62, positivePct + (wordCount > 60 ? 10 : 0)));
  const feasibilityBase = Math.min(95, Math.max(60, 80 + (constCount > 3 ? 10 : -5)));
  const impactBase = Math.min(99, Math.max(65, 75 + (urgentCount > 2 || posCount > 3 ? 14 : 5)));
  const coherenceBase = Math.min(97, Math.max(68, 78 + lengthBonus * 0.5));

  const compositeScore = Math.min(99, Math.round(
    (clarityBase * 0.25) +
    (persuasionBase * 0.25) +
    (feasibilityBase * 0.2) +
    (impactBase * 0.2) +
    (coherenceBase * 0.1)
  ));

  let tierGrade = 'Tier A • High Impact';
  if (compositeScore >= 92) {
    tierGrade = 'Tier A+ • Sovereign Dominance';
  } else if (compositeScore >= 84) {
    tierGrade = 'Tier A • Strategic Advantage';
  } else if (compositeScore >= 75) {
    tierGrade = 'Tier B+ • Strong Foundation';
  } else {
    tierGrade = 'Tier B • Calibration Required';
  }

  const emotionalTemperature = Math.round(Math.min(98, Math.max(22, (urgentPct * 0.6) + (positivePct * 0.4))));

  // Dominant keywords
  const keywordsList: { word: string; category: 'positive' | 'risk' | 'neutral' | 'action' }[] = [
    { word: 'High-Impact Moat', category: 'positive' },
    { word: 'Resource Efficiency', category: 'action' },
    { word: 'Latency Arbitration', category: 'neutral' },
    { word: 'Scalability Boundary', category: 'risk' },
    { word: 'Systemic Resilience', category: 'action' },
  ];

  // Specific dimensional metrics
  const metrics: MetricDimension[] = [
    {
      label: 'Strategic Persuasion',
      score: persuasionBase,
      benchmark: 'Top 4% Industry Benchmark',
      description: 'Ability to command executive conviction and align stakeholder capital.',
    },
    {
      label: 'Cognitive Clarity',
      score: clarityBase,
      benchmark: 'Top 7% Readability Index',
      description: 'Directness of structural hierarchy, semantic density, and low ambiguity.',
    },
    {
      label: 'Execution Feasibility',
      score: feasibilityBase,
      benchmark: 'Proven Implementation Path',
      description: 'Practicality of implementation timelines, resource allocation, and team capacity.',
    },
    {
      label: 'Systemic Impact',
      score: impactBase,
      benchmark: 'Transformative Vector',
      description: 'Magnitude of upside, defensibility of margins, and operational leverage.',
    },
    {
      label: 'Structural Coherence',
      score: coherenceBase,
      benchmark: 'Optimal Logical Flow',
      description: 'Internal consistency across premises, assertions, and supporting evidence.',
    },
  ];

  // Tailored Insights
  const insights: KeyInsight[] = [
    {
      id: 'ins-1',
      category: 'Strategic Advantage',
      title: 'Defensible Value Proposition & High Customer Retention',
      detail: `The discourse reveals a strong, defensible competitive posture with clear economic drivers (${wordCount} words analyzed). Value capture is strongly differentiated from commodity offerings.`,
      impactLevel: 'High',
      confidence: 96,
    },
    {
      id: 'ins-2',
      category: 'Critical Risk',
      title: 'Infrastructure Friction & Dependency Vulnerability',
      detail: `Critical dependencies on upstream systems and legacy pipeline friction represent the primary bottleneck to 10x scalability if unmitigated.`,
      impactLevel: riskFactor > 25 ? 'Critical' : 'Medium',
      confidence: 89,
    },
    {
      id: 'ins-3',
      category: 'Executive Observation',
      title: 'Asymmetric Return Potential with Controlled Downside',
      detail: `Capital and resource deployment metrics suggest a calculated risk-reward asymmetry where downside is bounded by structural safeguards while upside remains unconstrained.`,
      impactLevel: 'High',
      confidence: 92,
    },
    {
      id: 'ins-4',
      category: 'Operational Factor',
      title: 'Granular Governance & Rapid Incident Containment',
      detail: `SLA integrity and operational transparency provide exceptional leverage during institutional due diligence and enterprise procurement review.`,
      impactLevel: 'Medium',
      confidence: 87,
    },
  ];

  // Actionable Suggestions with smart rewrites
  const suggestions: ActionableSuggestion[] = [
    {
      id: 'sug-1',
      title: 'Reinforce Quantifiable Milestones with Exact ROI Bounds',
      originalSnippet: 'Enterprise pilot expansion requires dedicated integration engineering in legacy environments...',
      improvedVersion: 'Lock in a 90-day programmatic SLA: Guarantee sub-14 day deployment across SAP/Oracle environments with zero engineering overhead for the customer.',
      rationale: 'Converting an operational obstacle into a contractual guarantee eliminates customer procurement hesitation and justifies premium pricing.',
      expectedGain: '+24% Accelerated Enterprise Close Rate',
      effort: 'Low',
    },
    {
      id: 'sug-2',
      title: 'Formalize Autonomous Fallback Architecture & Hedging',
      originalSnippet: 'Hardware acceleration cluster constraints during peak freight quarters require strategic GPU reservation...',
      improvedVersion: 'Deploy a hybrid local/cloud failover topology with dynamic weight quantization that maintains 99.8% model accuracy even when GPU throttled.',
      rationale: 'Decoupling peak performance from volatile spot compute pricing preserves operating margins during seasonal spikes.',
      expectedGain: '31% Capex Variance Reduction',
      effort: 'Medium',
    },
    {
      id: 'sug-3',
      title: 'Implement Continuous Executive Telemetry Dashboards',
      originalSnippet: 'Incident timeline and corrective measures communicated via manual retrospective reports...',
      improvedVersion: 'Deploy real-time Solis cryptographic telemetry feeds accessible directly by executive sponsors and board observers.',
      rationale: 'Proactive observability shifts client perception from reactive incident recovery to institutional governance dominance.',
      expectedGain: '18% Higher Net Revenue Retention',
      effort: 'Low',
    },
  ];

  return {
    id: `solis-${Date.now()}`,
    title: extractTitle(text, sourceType),
    rawInput: text,
    sourceType,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    compositeScore,
    tierGrade,
    summaryHeadline: `Cognitive audit completed: High strategic density detected with ${overallTone.toLowerCase()} posture.`,
    summaryParagraph: `Solis AI neural parsing parsed ${wordCount} lexical tokens across multiple semantic vectors. The analysis confirms a strong operational foundation (${compositeScore}/100) with key leverage points centered on execution velocity and defensible architecture.`,
    metrics,
    sentiment: {
      positive: positivePct,
      neutral: Math.round(neutralPct),
      urgent: urgentPct,
      constructive: constructivePct,
      overallTone,
      emotionalTemperature,
      dominantKeywords: keywordsList,
    },
    insights,
    suggestions,
    tokensProcessed: Math.max(128, Math.round(wordCount * 1.35)),
    processingTimeMs: Math.round(780 + Math.random() * 420),
  };
}

function extractTitle(text: string, sourceType: 'text' | 'file' | 'preset'): string {
  if (sourceType === 'preset') {
    const firstLine = text.split('\n')[0].replace(/[#*:-]/g, '').trim();
    return firstLine.slice(0, 42) || 'Strategic AI Synthesis';
  }
  const clean = text.replace(/[\r\n]+/g, ' ').trim();
  if (clean.length > 50) {
    return clean.slice(0, 45) + '...';
  }
  return clean || 'Untitled Intelligence Input';
}
