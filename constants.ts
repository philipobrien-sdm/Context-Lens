import { StudentProfile, CognitiveStyle, TeacherProfile } from './types';

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  name: 'Educator',
  teachingStyle: 'Socratic (Question-driven)',
  comfortSubjects: ['General Literature', 'Critical Thinking'],
  communicationTone: 'Encouraging Mentor'
};

export const SAMPLE_PROFILES: StudentProfile[] = [
  {
    id: 'p1',
    name: 'Yuki',
    age: 16,
    nativeLanguage: 'Japanese',
    culture: 'Japanese contemporary',
    cognitiveStyle: CognitiveStyle.VISUAL,
    interests: ['Manga', 'Technology', 'Nature', 'Minimalism'],
    voicePreference: 'Kore',
    library: []
  },
  {
    id: 'p2',
    name: 'Mateo',
    age: 14,
    nativeLanguage: 'Spanish (Mexican)',
    culture: 'Mexican urban',
    cognitiveStyle: CognitiveStyle.NARRATIVE,
    interests: ['Soccer', 'Family traditions', 'Cooking', 'Music'],
    voicePreference: 'Fenrir',
    library: []
  },
  {
    id: 'p3',
    name: 'Alex',
    age: 10,
    nativeLanguage: 'English',
    culture: 'Internet/Gaming',
    cognitiveStyle: CognitiveStyle.LITERAL,
    interests: ['Minecraft', 'Trains', 'Systems engineering', 'Sci-Fi'],
    voicePreference: 'Puck',
    library: []
  }
];

export const AVAILABLE_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

export const SAMPLE_TOPICS = [
  "The Water Cycle and Weather Patterns",
  "Photosynthesis: How Plants Eat",
  "The Causes of the French Revolution",
  "Introduction to Fractions and Decimals",
  "Newton's Laws of Motion",
  "The Solar System and Space Exploration",
  "Ancient Egyptian Civilization",
  "The Concept of Democracy",
  "Ecosystems and Food Webs",
  "Plate Tectonics and Volcanoes",
  "The Hero's Journey in Literature",
  "Basic Economics: Supply and Demand"
];