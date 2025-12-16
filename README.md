# ContextLens

ContextLens is an AI-powered educational tool designed to personalize learning materials. It bridges the gap between a teacher's instructional style and a learner's specific context using the Google Gemini API.

![ContextLens App](https://via.placeholder.com/800x400?text=ContextLens+Preview)

## Features

*   **Dual-Profile System**: 
    *   **Student Context**: Tailors content to Age, Culture, Interests (e.g., Minecraft, Soccer), and Cognitive Style.
    *   **Teacher Identity**: Preserves the educator's Voice (e.g., Socratic, Narrative) and Expertise.
*   **Flexible Input**: 
    *   **Reframing**: Transforms existing texts (poems, word problems) into student-friendly versions.
    *   **Lesson Generation**: Takes abstract topics (e.g., "Photosynthesis") and generates analogy-driven lesson hooks.
    *   **Idea Spark**: Built-in library of kid-friendly topics to instantly demonstrate the tool's capabilities.
*   **AI Analysis**: Each generated card includes metrics for Cultural Resonance, Cognitive Fit, and Vocabulary Complexity.
*   **Text-to-Speech (TTS)**: Integrated high-quality audio playback using Gemini's TTS models with selectable voice personas.
*   **Personal Library**: Automatically saves all generated content to a persistent "Bookshelf" for each profile.
*   **Reporting & Portability**: 
    *   **HTML Reports**: Export full lesson packs into beautifully formatted, printable HTML reports containing profiles, source material, and strategies.
    *   **JSON Data**: Full Import/Export functionality for backing up or sharing data.

## How It Works

1.  **Select a Learner**: Define *who* needs to understand the concept.
2.  **Define Teacher Style**: Click the "Teacher" button to set your preferred delivery method (e.g., "Strict but Fair", "Storytelling").
3.  **Input Content**: 
    *   *Option A*: Paste a text (e.g., *Ozymandias*).
    *   *Option B*: Type a topic (e.g., *Gravity*).
    *   *Option C*: Click "Load Topic Idea" for a random suggestion.
4.  **Generate**: The AI creates 5 unique "entry points" for the lesson.
5.  **Review & Export**: Listen to the cards via TTS, save them to the library, or export a full HTML report for printing.

## Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
    *   *Text Model*: `gemini-2.5-flash`
    *   *Audio Model*: `gemini-2.5-flash-preview-tts`
*   **Visualization**: Recharts
*   **Icons**: Lucide React

## Setup

This application requires a Google Gemini API Key to function.

1.  Clone the repository.
2.  Install dependencies (if running locally).
3.  Ensure your environment has a valid `API_KEY` for the Google Gemini API.
4.  Run the application.

## License

MIT
