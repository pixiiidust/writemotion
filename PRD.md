# Product Requirements Document: WRITEMOTION

**Version:** 2.0.4  
**Status:** Active / Draft  
**Date:** October 26, 2025

**Author:** Product Engineering Team

---

## 1. Executive Summary

**WRITEMOTION** is a stylistic AI writing engine designed to solve the problem of "generic AI voice." Unlike standard LLM interfaces that produce flat, average-sounding text, WRITEMOTION acts as a stylistic synthesizer. It analyzes the user's unique writing voice to create a baseline "fingerprint" and blends it with the stylistic traits of specific target authors (e.g., Hemingway, Sorkin) to generate content that feels alive, personal, and intentional.

## 2. Problem Statement

*   **Generic Output:** Standard AI models regress to the mean, producing safe, bland, and recognizable "AI text."
*   **Loss of Voice:** Writers using AI tools often feel their unique voice is erased during the editing process.
*   **Lack of Granularity:** Existing tools offer broad "Formal" or "Casual" toggles but lack specific stylistic mimicry (e.g., "Use the sentence variety of Virginia Woolf but the vocabulary of the user").

## 3. Goals & Objectives

*   **Primary Goal:** Enable users to generate text that retains their authentic voice while borrowing specific stylistic devices from chosen influences.
*   **Key Metric:** User acceptance rate of AI suggestions (Target: >30%).
*   **Privacy:** Ensure all analysis and generation happens client-side or via ephemeral API calls; no user text is stored on external servers permanently.

## 4. User Personas

*   **The Creative Writer:** Needs to break writer's block or experiment with different narrative voices without losing their core identity.
*   **The Content Marketer:** Needs to maintain brand voice consistency while adapting tone for different channels (e.g., punchy for social, formal for whitepapers).
*   **The Journalist/Essayist:** Wants to refine the rhythm and flow of their drafts using high-quality stylistic references.

---

## 5. Functional Requirements

### 5.1 Dashboard & Style Extraction
**Feature:** Style Fingerprinting  
**Description:** Users must be able to upload samples to establish a stylistic baseline.

*   **Input:**
    *   Text area for direct paste (supports >500 words).
    *   File upload (.txt, .md, .doc, .docx, .pdf).
*   **Analysis:**
    *   System utilizes **Gemini 2.5 Flash** to extract metrics.
*   **Output (The Fingerprint):**
    *   Radar Chart visualizing 6 axes: Vocabulary Complexity, Sentence Variety, Formality, Imagery, Warmth, Pacing.
    *   Textual summary of "Dominant Trait" (e.g., High Imagery) and "Syntax Model" (e.g., Complex Varied).
*   **Data Management:**
    *   Ability to clear/reset the fingerprint to start over.

### 5.2 The Editor
**Feature:** Split-screen Drafting Environment  
**Description:** A distraction-free writing interface coupled with a control rig for AI generation.

*   **Canvas:**
    *   Main text area with support for long-form text.
    *   Selection-based interaction: Highlighting text triggers the "Process Selection" floating action button.
*   **Author Library:**
    *   **System Authors:** Pre-loaded set of diverse styles (Hemingway, Woolf, Sorkin, Graham, Didion, Orwell, Oliver).
    *   **Custom Personas:** Users can search for any author. The system dynamically generates a style vector (Traits, Description, Category) using AI.
    *   **Persistence:** Users can choose to save generated authors to "Local Library" (LocalStorage) or keep them session-only.
*   **Control Rig:**
    *   **Blend Intensity (0.0 - 1.0):** Controls the ratio between User Baseline (Anchor) and Target Author (Spice).
    *   **Tone Modulation:** Modifiers for Neutral, Formal, Casual, or Poetic output.
    *   **Active Scribes:** Support for selecting up to 2 simultaneous influence authors.

### 5.3 Generation & Blending
**Feature:** Stylistic Rewrite Engine  
**Description:** The core AI loop that processes input text against the style config.

*   **Logic:**
    1.  Construct prompt with User Metrics + Target Author Traits.
    2.  Apply drift correction instructions (prevent archaic vocabulary for modern contexts).
    3.  Generate suggestions using **Gemini 2.5 Flash**.
*   **Output Queue:**
    *   Display generated rewrites in a side panel.
    *   Show "Similarity Score" (Confidence/Match % to requested style).
    *   Show "Rationale" (Why the AI made specific changes, e.g., "Adopted Sorkin's repetition").
    *   "Commit Changes" button replaces text in the canvas.

### 5.4 Export & Session Management
**Feature:** Output Formatting  
**Description:** Getting text out of the tool.

*   **Formats:**
    *   Clipboard copy.
    *   .txt (Plain Text).
    *   .md (Markdown).
    *   .pdf (Styled PDF via jsPDF).
*   **Session Stats:**
    *   Track number of outputs generated vs. accepted to calculate "Yield" %.

---

## 6. Non-Functional Requirements

*   **Performance:** Style analysis should complete in <3 seconds. Rewrite generation should complete in <5 seconds.
*   **Aesthetics:** "Industrial/Brutalist" UI.
    *   Font stack: 'Chakra Petch' (Display), 'Space Mono' (Data), 'Inter' (UI).
    *   High contrast: Ink (#121212), Paper (#F2F2EC), Industrial Orange (#FF3B00).
*   **Compatibility:** Responsive design (Mobile/Desktop). Chrome/Firefox/Safari/Edge.
*   **Security:** API Key stored in environment variables. No backend database (Client-side storage only).

---

## 7. Technical Architecture

### 7.1 Tech Stack
*   **Frontend Framework:** React 19
*   **Styling:** Tailwind CSS (Custom config for fonts/colors)
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
*   **Visualization:** Recharts (Radar charts)
*   **Icons:** Lucide React

### 7.2 Data Models
*   **UserProfile:** Stores the computed `StyleMetrics` (0-100 scales).
*   **ReferenceAuthor:** Stores metadata (Name, Description, Traits) and `isCustom` flag.
*   **RewriteSuggestion:** Stores the result, rationale, and similarity score.

### 7.3 API Integration
*   **Model:** `gemini-2.5-flash` used for both Analysis and Generation to ensure speed and cost-efficiency.
*   **Prompt Engineering:**
    *   *System Instructions* heavily utilized to enforce "Anti-Generic" filters (banning words like "delve", "tapestry").
    *   Structured JSON output schema enforced for all API responses to ensure type safety in the UI.

---

## 8. Future Roadmap (v2.1+)

1.  **Direct comparison view:** Diff view showing exactly what words were changed.
2.  **Audio Blending:** Text-to-speech utilizing the style metrics to determine cadence/speed.
3.  **Batch Processing:** Upload a whole document and rewrite it chapter by chapter.
4.  **Chairman Model Upgrade:** Option to toggle `Gemini 3.0 Pro` for higher-reasoning tasks.
