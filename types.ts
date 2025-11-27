export interface StyleMetrics {
  vocabularyComplexity: number;
  sentenceVariety: number;
  formality: number;
  imagery: number;
  warmth: number;
  pacing: number;
}

export interface UserProfile {
  name: string;
  hasAnalyzedSamples: boolean;
  baseStyle: StyleMetrics;
  sampleText: string; // The raw text used for analysis
}

export interface ReferenceAuthor {
  id: string;
  name: string;
  description: string;
  traits: string[];
  avatarUrl: string;
  category: 'Fiction' | 'Non-Fiction' | 'Journalism' | 'Poetry' | 'Screenwriting';
  isCustom?: boolean;
}

export interface RewriteSuggestion {
  id: string;
  originalText: string;
  rewrittenText: string;
  rationale: string;
  similarityScore: number; // Confidence/Anchor score
}

export interface EditorSettings {
  blendIntensity: number; // 0 to 1
  targetAuthorIds: string[]; // Support for 1-2 authors
  toneShift: 'neutral' | 'more-formal' | 'more-casual' | 'more-poetic';
}

export interface SessionStats {
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  sessionDuration: number; // in minutes
}