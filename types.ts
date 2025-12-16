export enum CognitiveStyle {
  LITERAL = 'Literal/Structured',
  ABSTRACT = 'Abstract/Conceptual',
  VISUAL = 'Visual/Spatial',
  NARRATIVE = 'Narrative/Social',
  AUDITORY = 'Auditory/Musical'
}

export interface TeacherProfile {
  name: string;
  teachingStyle: string; // e.g., "Socratic", "Lecture", "Project-Based", "Facilitator"
  comfortSubjects: string[]; // e.g., "Literature", "History"
  communicationTone: string; // e.g., "Formal", "Playful", "Mentorship"
}

export interface ReframingCard {
  id: string;
  title: string;
  reframedText: string;
  reflectionQuestion: string;
  analysis: {
    culturalResonance: number;
    cognitiveFit: number;
    vocabularyComplexity: number;
  };
}

export interface LibraryEntry {
  id: string;
  timestamp: number;
  sourceText: string;
  cards: ReframingCard[];
}

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  nativeLanguage: string;
  culture: string;
  cognitiveStyle: CognitiveStyle;
  interests: string[];
  voicePreference: string; // For TTS: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
  library: LibraryEntry[];
}

export interface GenerationResponse {
  cards: ReframingCard[];
}