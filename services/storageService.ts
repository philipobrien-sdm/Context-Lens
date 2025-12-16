import { StudentProfile, TeacherProfile, ReframingCard } from '../types';
import { SAMPLE_PROFILES, DEFAULT_TEACHER_PROFILE } from '../constants';

const STORAGE_KEY_PROFILES = 'contextlens_profiles';
const STORAGE_KEY_TEACHER = 'contextlens_teacher';

export const getProfiles = (): StudentProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  if (!stored) {
    return SAMPLE_PROFILES;
  }
  try {
    const parsed = JSON.parse(stored);
    // basic schema migration/validation to ensure library array exists
    return parsed.map((p: any) => ({
      ...p,
      library: Array.isArray(p.library) ? p.library : []
    }));
  } catch (e) {
    console.error("Failed to parse profiles", e);
    return SAMPLE_PROFILES;
  }
};

export const saveProfiles = (profiles: StudentProfile[]) => {
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
};

export const saveProfile = (profile: StudentProfile) => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  saveProfiles(profiles);
};

export const deleteProfile = (id: string) => {
  const profiles = getProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  saveProfiles(filtered);
};

// Teacher Profile Storage
export const getTeacherProfile = (): TeacherProfile => {
  const stored = localStorage.getItem(STORAGE_KEY_TEACHER);
  if (!stored) {
    return DEFAULT_TEACHER_PROFILE;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_TEACHER_PROFILE;
  }
};

export const saveTeacherProfile = (profile: TeacherProfile) => {
  localStorage.setItem(STORAGE_KEY_TEACHER, JSON.stringify(profile));
};

// JSON Export/Import helpers
export const exportData = (): string => {
  const profiles = getProfiles();
  const teacher = getTeacherProfile();
  return JSON.stringify({ profiles, teacher }, null, 2);
};

export const importData = (jsonString: string): { profiles: StudentProfile[], teacher: TeacherProfile } => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Support legacy export format (array only) or new object format
    let profiles: StudentProfile[] = [];
    let teacher: TeacherProfile = DEFAULT_TEACHER_PROFILE;

    if (Array.isArray(parsed)) {
      profiles = parsed;
    } else {
      profiles = Array.isArray(parsed.profiles) ? parsed.profiles : [];
      teacher = parsed.teacher || DEFAULT_TEACHER_PROFILE;
    }

    // Basic validation
    const isValid = profiles.every((p: any) => p.id && p.name && p.nativeLanguage);
    if (!isValid) throw new Error("Invalid format: Missing required profile fields");

    saveProfiles(profiles);
    saveTeacherProfile(teacher);
    return { profiles, teacher };
  } catch (e) {
    console.error("Import failed", e);
    throw e;
  }
};

export const downloadHTMLReport = (
  sourceText: string,
  cards: ReframingCard[],
  student: StudentProfile,
  teacher: TeacherProfile
) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ContextLens Lesson Report: ${student.name}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #f9fafb; }
        .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
        h1 { color: #4f46e5; margin-bottom: 0.5rem; }
        h2 { color: #111827; margin-top: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; font-size: 1.25rem; }
        h3 { color: #4338ca; margin-top: 1.5rem; font-size: 1.1rem; }
        .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; background: #f3f4f6; padding: 20px; border-radius: 12px; }
        .meta-box h4 { margin: 0 0 10px 0; color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
        .meta-box p { margin: 5px 0; font-size: 0.95rem; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 25px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); page-break-inside: avoid; }
        .card h3 { margin-top: 0; color: #1f2937; }
        .reflection { background: #fffbeb; border-left: 4px solid #fcd34d; padding: 15px; margin-top: 15px; color: #92400e; font-style: italic; border-radius: 0 4px 4px 0; }
        .stats { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; font-size: 0.8rem; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 15px; }
        .stat-item { background: #f9fafb; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
        .source-text { background: #f3f4f6; padding: 20px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; font-size: 0.9rem; border: 1px solid #e5e7eb; max-height: 300px; overflow-y: auto; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 0.875rem; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        @media print { body { background: white; padding: 0; } .container { box-shadow: none; padding: 0; border: none; } .source-text { max-height: none; } }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ContextLens Report</h1>
        <p style="color: #6b7280; margin-bottom: 30px; margin-top: 0;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>

        <div class="meta">
          <div class="meta-box">
            <h4>Teacher Profile</h4>
            <p><strong>Name:</strong> ${teacher.name}</p>
            <p><strong>Style:</strong> ${teacher.teachingStyle}</p>
            <p><strong>Tone:</strong> ${teacher.communicationTone}</p>
          </div>
          <div class="meta-box">
            <h4>Student Profile</h4>
            <p><strong>Name:</strong> ${student.name} (${student.age}y)</p>
            <p><strong>Culture:</strong> ${student.culture}</p>
            <p><strong>Interests:</strong> ${student.interests.join(', ')}</p>
            <p><strong>Cognitive Style:</strong> ${student.cognitiveStyle}</p>
          </div>
        </div>

        <h2>Topic / Source Material</h2>
        <div class="source-text">${sourceText}</div>

        <h2>Instructional Strategies</h2>
        ${cards.map((card, i) => `
          <div class="card">
            <h3>Strategy ${i + 1}: ${card.title}</h3>
            <p style="white-space: pre-wrap;">${card.reframedText}</p>
            <div class="reflection">
              <strong>Reflection:</strong> ${card.reflectionQuestion}
            </div>
            <div class="stats">
              <span class="stat-item">Cultural Resonance: ${card.analysis.culturalResonance}%</span>
              <span class="stat-item">Cognitive Fit: ${card.analysis.cognitiveFit}%</span>
              <span class="stat-item">Vocabulary Level: ${card.analysis.vocabularyComplexity}%</span>
            </div>
          </div>
        `).join('')}

        <div class="footer">
          Generated with <strong>ContextLens</strong> • Empowering Personalized Education
        </div>
      </div>
    </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ContextLens-Lesson-${student.name.replace(/\s+/g, '-')}-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};