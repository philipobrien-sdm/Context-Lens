import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StudentProfile, TeacherProfile, GenerationResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateReframings = async (
  input: string,
  studentProfile: StudentProfile,
  teacherProfile: TeacherProfile
): Promise<GenerationResponse> => {
  const prompt = `
    You are ContextLens, an advanced instructional design assistant.
    Your task is to help a teacher named ${teacherProfile.name} teach a concept to a student named ${studentProfile.name}.

    The user input below might be a **Specific Text Excerpt** (e.g., a poem, a historical quote, a math problem) OR a **Lesson Topic/Idea** (e.g., "Photosynthesis", "The causes of WWI", "Fractions").

    1. **Analyze the Input**: Determine if it is a specific text to reframe, or a general topic to explain.
    2. **Bridge the Gap**: Connect the Student's context (for understanding) with the Teacher's style (for delivery).

    ---
    TEACHER PROFILE (The Delivery Method):
    - Style: ${teacherProfile.teachingStyle}
    - Tone: ${teacherProfile.communicationTone}
    - Comfort Subjects: ${teacherProfile.comfortSubjects.join(', ')}

    STUDENT PROFILE (The Hook & Analogy Source):
    - Age: ${studentProfile.age}
    - Culture: ${studentProfile.culture}
    - Cognitive Style: ${studentProfile.cognitiveStyle}
    - Interests: ${studentProfile.interests.join(', ')}
    - Native Language: ${studentProfile.nativeLanguage}
    ---

    INPUT (Text or Lesson Idea):
    "${input}"

    ---
    TASK:
    Generate 5 distinct educational cards. Each card acts as a specific lesson plan snippet or explanation strategy.

    REQUIREMENTS for each card:
    1. **The Hook**: Use the *Student's* interests/culture to create an analogy or entry point.
    2. **The Delivery**: Frame the explanation using the *Teacher's* specified style.
    3. **Content Handling**:
       - If INPUT is a **Topic**: Generate a clear, age-appropriate explanation of that topic, then wrap it in the analogy.
       - If INPUT is a **Text**: Keep the core meaning/structure of the text but "translate" the context/metaphors to fit the student.
    4. **Reflection**: A question for the student to answer to check understanding.

    OUTPUT JSON SCHEMA:
    {
      "cards": [
        {
          "id": "string",
          "title": "Short catchy title combining student interest + topic",
          "reframedText": "The actual explanation script for the teacher to use.",
          "reflectionQuestion": "Question for the student",
          "analysis": {
            "culturalResonance": integer (1-100),
            "cognitiveFit": integer (1-100),
            "vocabularyComplexity": integer (1-100)
          }
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  reframedText: { type: Type.STRING },
                  reflectionQuestion: { type: Type.STRING },
                  analysis: {
                    type: Type.OBJECT,
                    properties: {
                      culturalResonance: { type: Type.INTEGER },
                      cognitiveFit: { type: Type.INTEGER },
                      vocabularyComplexity: { type: Type.INTEGER }
                    }
                  }
                },
                required: ['id', 'title', 'reframedText', 'reflectionQuestion', 'analysis']
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GenerationResponse;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voiceName: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return await audioContext.decodeAudioData(bytes.buffer);
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};