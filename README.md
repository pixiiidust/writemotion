# WRITEMOTION

**WRITEMOTION** helps your writing feel more human by blending your natural voice with the styles of authors you admire. 
Instead of producing generic AI text, it builds a fingerprint of your unique writing style, learns from writers you choose, and combines both into suggestions that feel alive and personal.

# Screenshots
<img width="1266" height="939" alt="image" src="https://github.com/user-attachments/assets/96db35b1-b293-41eb-a8af-cc6448810abd" />
<img width="1142" height="854" alt="image" src="https://github.com/user-attachments/assets/972ef6a8-da5c-4189-ac54-93d28608f05d" />

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
