# WRITEMOTION

**Stylistic AI Writing Engine.**

WRITEMOTION helps your writing feel more human by blending your natural voice with the styles of authors you admire. Instead of producing generic AI text, it builds a fingerprint of your unique writing style, learns from writers you choose, and combines both into suggestions that feel alive and personal.

# Screenshots
<img width="1225" height="919" alt="image" src="https://github.com/user-attachments/assets/acd179d0-ff3f-403b-afc9-44125931152f" />
<img width="1428" height="1092" alt="image" src="https://github.com/user-attachments/assets/e37bb96a-5a5c-4a14-9d75-2b8a8a12faf7" />

# How it works

### Stage 1: Style Extraction
Upload a text file or paste your own writing samples into the Dashboard. WRITEMOTION uses **Gemini 2.5 Flash** to analyze your text and build a visual **Style Fingerprint** based on six metrics: Vocabulary, Variety, Formality, Imagery, Warmth, and Pacing.

### Stage 2: Author Inspiration
Enter the Editor. Choose from a curated library of scribes (Hemingway, Woolf, Sorkin, etc.) or use the **Generate Profile** feature to create new author personas on the fly.

### Stage 3: Blending
Adjust the **Blend Intensity** and **Tone Modulation** controls. This determines how much of the target author's influence ("Spice") is mixed with your baseline style ("Anchor").

### Stage 4: Writing Assistance
Select text in your draft or write fresh content. Click **Blend Selection** to generate rewrites. The AI acts as a writing coach, rewriting text while strictly preserving your authentic voice structure.

### Stage 5: Export
Once your draft is complete, use the Export menu to copy to clipboard, or download as `.txt`, `.md`, or a styled `.pdf`.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env` file in the project root and add your Google Gemini API key. You can get one at [aistudio.google.com](https://aistudio.google.com).

```env
API_KEY=your_gemini_api_key_here
```

### 3. Run the App

```bash
npm run dev
```

Then open the local URL in your browser (usually http://localhost:1234).

## Tech Stack

*   **Frontend**: React + Tailwind CSS
*   **AI SDK**: Google GenAI SDK (`@google/genai`)
*   **Models**: Gemini 2.5 Flash (Analysis & Generation)
