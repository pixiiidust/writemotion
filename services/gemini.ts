import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StyleMetrics, RewriteSuggestion, ReferenceAuthor } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = "gemini-2.5-flash";
const WRITING_MODEL = "gemini-2.5-flash"; // Fast enough for interactive editing

/**
 * Analyzes a text sample to extract style metrics.
 */
export const analyzeStyle = async (text: string): Promise<StyleMetrics> => {
  if (!text || text.length < 50) {
    // Return default neutral metrics if text is too short
    return {
      vocabularyComplexity: 50,
      sentenceVariety: 50,
      formality: 50,
      imagery: 50,
      warmth: 50,
      pacing: 50
    };
  }

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      vocabularyComplexity: { type: Type.NUMBER, description: "0-100 score of vocabulary rarity and sophistication." },
      sentenceVariety: { type: Type.NUMBER, description: "0-100 score of sentence length variation and structural complexity." },
      formality: { type: Type.NUMBER, description: "0-100 score from casual (0) to academic/formal (100)." },
      imagery: { type: Type.NUMBER, description: "0-100 score of metaphor usage and descriptive language." },
      warmth: { type: Type.NUMBER, description: "0-100 score of emotional resonance and friendliness." },
      pacing: { type: Type.NUMBER, description: "0-100 score: 0 is slow/deliberate, 100 is fast/punchy." },
    },
    required: ["vocabularyComplexity", "sentenceVariety", "formality", "imagery", "warmth", "pacing"],
  };

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: `Analyze the writing style of the following text. Provide quantitative scores (0-100) for the requested metrics.
      
      Text to analyze:
      "${text.substring(0, 2000)}..."`, // Truncate to avoid token limits on massive pastes
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "{}");
    return data as StyleMetrics;
  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback
    return {
      vocabularyComplexity: 50,
      sentenceVariety: 50,
      formality: 50,
      imagery: 50,
      warmth: 50,
      pacing: 50
    };
  }
};

/**
 * Generates a stylistic persona for a given author name.
 */
export const generateAuthorPersona = async (authorName: string): Promise<ReferenceAuthor | null> => {
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: "A concise (max 10 words) description of their writing style." },
      traits: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Exactly 3 single-word adjectives describing their voice (e.g., 'Stoic', 'Lyrical')."
      },
      category: { 
        type: Type.STRING, 
        enum: ['Fiction', 'Non-Fiction', 'Journalism', 'Poetry', 'Screenwriting'],
        description: "The primary genre the author is known for."
      }
    },
    required: ["description", "traits", "category"]
  };

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: `Generate a stylistic profile for the author: "${authorName}".
      If the author is well-known, describe their actual style.
      If the author is unknown or fictional, create a plausible style profile based on the name context or generic writer traits, but try to be specific.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Generate a random color for the avatar to make it distinct
    const colors = ['0ea5e9', '8b5cf6', 'f59e0b', '10b981', 'f43f5e', '6366f1'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Construct the ReferenceAuthor object
    return {
      id: `generated-${Date.now()}`,
      name: authorName,
      description: data.description,
      traits: data.traits.slice(0, 3),
      category: data.category,
      // Use UI Avatars with Initials
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=${randomColor}&color=fff&bold=true&length=2`,
      isCustom: true
    };
  } catch (error) {
    console.error("Author persona generation failed", error);
    return null;
  }
};

/**
 * Generates rewrite suggestions blending user style with target authors.
 */
export const generateRewrites = async (
  originalText: string,
  userMetrics: StyleMetrics,
  authorNames: string[],
  intensity: number,
  tone: string
): Promise<RewriteSuggestion[]> => {
  
  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        rewrittenText: { type: Type.STRING, description: "The rewritten text, including \\n\\n for paragraph breaks." },
        rationale: { type: Type.STRING, description: "Specific stylistic device borrowed (e.g., 'Used Hemingway's parataxis' or 'Adopted Sorkin's repetition')." },
        similarityScore: { type: Type.NUMBER, description: "0-100 confidence score indicating how well it preserves the user's authentic voice while applying the blend." }
      },
      required: ["rewrittenText", "rationale", "similarityScore"]
    }
  };

  const authorsString = authorNames.join(" and ");

  const systemInstruction = `You are WRITEMOTION, an advanced AI writing coach. 
  Your goal is to rewrite the user's text by blending their *authentic* baseline style with the stylistic strengths of selected reference authors.
  
  User's Baseline Style Fingerprint (The Anchor):
  - Vocabulary Complexity: ${userMetrics.vocabularyComplexity}/100
  - Formality: ${userMetrics.formality}/100
  - Pacing: ${userMetrics.pacing}/100
  - Imagery: ${userMetrics.imagery}/100
  
  Target Reference Influence (The Spice): ${authorsString}
  Blend Intensity: ${intensity * 100}% (0% = Pure User, 100% = Pure Author Mimicry)
  Tone Adjustment: ${tone}

  Directives:
  1. **Preserve Voice**: The result must sound like the user, just elevated. Do not turn the user into a caricature of the target author unless intensity is very high (>80%).
  2. **Drift Correction**: If the target author is historically distant (e.g., Woolf) and the user is modern, only borrow the *rhythm* or *imagery*, not archaic vocabulary.
  3. **Anti-Generic Filter**: Do not use "delve", "testament", "tapestry", "underscores", "complex landscape", or other generic AI markers. Use specific, punchy, concrete words.
  4. **Structure & Formatting**: 
     - **CRITICAL**: Maintain the original paragraph structure. If the input is a long block, break it into logical paragraphs. 
     - Use double newlines (\\n\\n) to separate paragraphs in your output string. 
     - Never output a single wall of text for multi-paragraph content.
  5. **Authenticity Check**: If the blend feels unnatural, lean closer to the user's baseline.
  6. **Punctuation**: Strictly AVOID using em dashes (—). Use commas, periods, or parentheses instead.
  `;

  try {
    const response = await ai.models.generateContent({
      model: WRITING_MODEL,
      contents: `Rewrite this text:\n"${originalText}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.85 // High enough for creativity, low enough to follow instructions
      }
    });

    const rawSuggestions = JSON.parse(response.text || "[]");
    
    return rawSuggestions.map((s: any, index: number) => ({
      id: `sugg-${Date.now()}-${index}`,
      originalText,
      rewrittenText: s.rewrittenText,
      rationale: s.rationale,
      similarityScore: s.similarityScore
    }));
  } catch (error) {
    console.error("Rewrite generation failed", error);
    return [];
  }
};