import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile, ReframingCard as ReframingCardType, LibraryEntry, TeacherProfile } from './types';
import { getProfiles, saveProfile, deleteProfile, exportData, importData, getTeacherProfile, saveTeacherProfile, downloadHTMLReport } from './services/storageService';
import { generateReframings } from './services/geminiService';
import { SAMPLE_TOPICS } from './constants';
import ProfileManager from './components/ProfileManager';
import ReframingCard from './components/ReframingCard';
import { Layout, BookOpen, Loader, Wand2, ArrowRight, Quote, Download, Upload, Library, Trash, ChevronDown, ChevronUp, GraduationCap, X, Save, HelpCircle, Lightbulb, User, Sparkles, FileText } from 'lucide-react';

const OZYMANDIAS_TEXT = `I met a traveller from an antique land,
Who said—“Two vast and trunkless legs of stone
Stand in the desert. . . . Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away.”`;

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ReframingCardType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);

  // Teacher Edit State
  const [teacherEditForm, setTeacherEditForm] = useState<TeacherProfile>({
    name: '',
    teachingStyle: '',
    comfortSubjects: [],
    communicationTone: ''
  });

  useEffect(() => {
    const loadedProfiles = getProfiles();
    const loadedTeacher = getTeacherProfile();
    setProfiles(loadedProfiles);
    setTeacherProfile(loadedTeacher);
    setTeacherEditForm(loadedTeacher);
    if (loadedProfiles.length > 0) {
      setCurrentProfile(loadedProfiles[0]);
    }
  }, []);

  const handleSaveProfile = (profile: StudentProfile) => {
    saveProfile(profile);
    setProfiles(getProfiles());
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    const updated = getProfiles();
    setProfiles(updated);
    if (currentProfile?.id === id) {
      setCurrentProfile(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleSaveTeacherProfile = () => {
    saveTeacherProfile(teacherEditForm);
    setTeacherProfile(teacherEditForm);
    setIsTeacherModalOpen(false);
  };

  const handleLoadDemo = () => {
    setInputText(OZYMANDIAS_TEXT);
  };

  const handleLoadTopicDemo = () => {
    const randomTopic = SAMPLE_TOPICS[Math.floor(Math.random() * SAMPLE_TOPICS.length)];
    setInputText(randomTopic);
  };

  const handleGenerate = async () => {
    if (!currentProfile || !teacherProfile || !inputText.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const response = await generateReframings(inputText, currentProfile, teacherProfile);
      setResults(response.cards);

      // Save to Library
      const newEntry: LibraryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        sourceText: inputText,
        cards: response.cards
      };

      const updatedProfile = {
        ...currentProfile,
        library: [newEntry, ...(currentProfile.library || [])]
      };
      
      saveProfile(updatedProfile);
      setProfiles(getProfiles());
      setCurrentProfile(updatedProfile);

    } catch (err) {
      setError("Failed to generate content. Please check your API Key and try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contextlens-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const result = importData(json);
        setProfiles(result.profiles);
        setTeacherProfile(result.teacher);
        setTeacherEditForm(result.teacher);
        if (result.profiles.length > 0) {
          setCurrentProfile(result.profiles[0]);
        }
        alert('Data imported successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to import data. Please ensure the file is valid JSON from ContextLens.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleDeleteLibraryEntry = (entryId: string) => {
    if (!currentProfile) return;
    const updatedLibrary = currentProfile.library.filter(e => e.id !== entryId);
    const updatedProfile = { ...currentProfile, library: updatedLibrary };
    saveProfile(updatedProfile);
    setProfiles(getProfiles());
    setCurrentProfile(updatedProfile);
  };

  const loadFromLibrary = (entry: LibraryEntry) => {
    setInputText(entry.sourceText);
    setResults(entry.cards);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadReport = (entrySourceText: string, entryCards: ReframingCardType[]) => {
    if (!currentProfile || !teacherProfile) return;
    downloadHTMLReport(entrySourceText, entryCards, currentProfile, teacherProfile);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
              <Layout className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              ContextLens
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsTeacherModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
              title="Teacher Settings"
            >
              <GraduationCap size={18} />
              <span className="hidden sm:inline">Teacher</span>
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Import Data"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button 
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Export Data"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
             <button
              onClick={() => setIsAboutModalOpen(true)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="About ContextLens"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Section */}
        <ProfileManager 
          profiles={profiles}
          currentProfile={currentProfile}
          onSelectProfile={setCurrentProfile}
          onSaveProfile={handleSaveProfile}
          onDeleteProfile={handleDeleteProfile}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
             {/* Input Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all focus-within:ring-2 ring-indigo-100 ring-offset-2">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 p-1.5 rounded-md text-indigo-600">
                    <Lightbulb size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Topic or Text</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadTopicDemo}
                    className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Sparkles size={14} />
                    Load Topic Idea
                  </button>
                  <button
                    onClick={handleLoadDemo}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Quote size={14} />
                    Load Text Demo
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter a lesson topic (e.g. 'Photosynthesis', 'The French Revolution') OR paste a text excerpt to reframe..."
                className="w-full h-40 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-shadow text-base bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
              />
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                   {teacherProfile && (
                     <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                        <GraduationCap size={14} />
                        Style: <strong>{teacherProfile.teachingStyle}</strong>
                     </span>
                   )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim() || !currentProfile}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-indigo-200 ${
                    isGenerating || !inputText.trim() || !currentProfile
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      Designing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Create Lesson Plan
                      <ArrowRight className="h-5 w-5 opacity-50" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}
            </section>

            {/* Results Section */}
            {results.length > 0 && (
              <section className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Instructional Strategies
                  </h2>
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => handleDownloadReport(inputText, results)}
                        className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                        title="Export Report to HTML"
                      >
                        <FileText size={16} />
                        <span className="hidden sm:inline">Export Report</span>
                      </button>
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                      {results.length} approaches
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {results.map((card) => (
                    <div key={card.id} className="min-h-[300px]">
                      <ReframingCard card={card} profile={currentProfile!} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Bookshelf Sidebar */}
          <div className="lg:col-span-4">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div 
                  className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                >
                   <div className="flex items-center gap-2">
                      <Library className="text-indigo-600 h-5 w-5" />
                      <h3 className="font-bold text-gray-800">{currentProfile ? `${currentProfile.name}'s Library` : 'Library'}</h3>
                   </div>
                   {isLibraryOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </div>

                {isLibraryOpen && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-2 space-y-2">
                     {!currentProfile ? (
                        <div className="text-center p-8 text-gray-400 text-sm">
                           Select a profile to view library
                        </div>
                     ) : currentProfile.library && currentProfile.library.length > 0 ? (
                        currentProfile.library.map((entry) => (
                           <div key={entry.id} className="group p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                 <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                 </span>
                                 <div className="flex gap-1">
                                    <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadReport(entry.sourceText, entry.cards);
                                        }}
                                        className="text-gray-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                        title="Export HTML Report"
                                    >
                                        <FileText size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteLibraryEntry(entry.id);
                                        }}
                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                        title="Delete Entry"
                                    >
                                        <Trash size={14} />
                                    </button>
                                 </div>
                              </div>
                              <p className="text-xs text-gray-600 font-medium line-clamp-2 mb-3 font-serif italic border-l-2 border-gray-200 pl-2">
                                 "{entry.sourceText.substring(0, 100)}{entry.sourceText.length > 100 ? '...' : ''}"
                              </p>
                              <button 
                                 onClick={() => loadFromLibrary(entry)}
                                 className="w-full text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              >
                                 Load {entry.cards.length} Cards
                              </button>
                           </div>
                        ))
                     ) : (
                        <div className="text-center p-8 text-gray-400 text-sm flex flex-col items-center gap-2">
                           <BookOpen size={32} className="opacity-20" />
                           <p>No saved reframings yet.</p>
                           <p className="text-xs">Generate content to save it here automatically.</p>
                        </div>
                     )}
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      {/* Teacher Profile Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Teacher Profile</h3>
                    <p className="text-xs text-gray-500">Customize how content is delivered</p>
                  </div>
               </div>
              <button 
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={teacherEditForm.name}
                    onChange={(e) => setTeacherEditForm({...teacherEditForm, name: e.target.value})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Ms. Frizzle"
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Teaching Style</label>
                  <select
                    value={teacherEditForm.teachingStyle}
                    onChange={(e) => setTeacherEditForm({...teacherEditForm, teachingStyle: e.target.value})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                     <option value="Socratic (Question-driven)">Socratic (Question-driven)</option>
                     <option value="Storytelling (Narrative)">Storytelling (Narrative)</option>
                     <option value="Direct Instruction (Lecture)">Direct Instruction (Lecture)</option>
                     <option value="Project-Based (Hands-on)">Project-Based (Hands-on)</option>
                     <option value="Analogy-Heavy (Comparative)">Analogy-Heavy (Comparative)</option>
                     <option value="Gamified (Playful)">Gamified (Playful)</option>
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Communication Tone</label>
                  <select
                    value={teacherEditForm.communicationTone}
                    onChange={(e) => setTeacherEditForm({...teacherEditForm, communicationTone: e.target.value})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                     <option value="Encouraging Mentor">Encouraging Mentor</option>
                     <option value="Strict but Fair">Strict but Fair</option>
                     <option value="Academic & Formal">Academic & Formal</option>
                     <option value="Casual & Relatable">Casual & Relatable</option>
                     <option value="Enthusiastic & High Energy">Enthusiastic & High Energy</option>
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Comfort Subjects / Expertise</label>
                  <input
                    type="text"
                    value={teacherEditForm.comfortSubjects.join(', ')}
                    onChange={(e) => setTeacherEditForm({...teacherEditForm, comfortSubjects: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. History, Literature, Debate"
                  />
                  <p className="text-xs text-gray-400 mt-1">The AI will leverage these strengths in its explanations.</p>
               </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setIsTeacherModalOpen(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTeacherProfile}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-all"
              >
                <Save size={16} />
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
             
             {/* Decorative Background Blob */}
             <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

              <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg text-white">
                       <Layout size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold text-gray-900">About ContextLens</h2>
                       <p className="text-indigo-600 font-medium">Bridging Teachers & Learners with AI</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setIsAboutModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                 >
                    <X size={24} />
                 </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                 <p className="text-gray-600 leading-relaxed">
                    ContextLens is an instructional design copilot for educators. It solves a fundamental problem in education: 
                    <span className="font-semibold text-gray-800"> making complex content resonate with diverse learners without compromising the teacher's authentic voice.</span>
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                       <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                          <Wand2 size={16} /> For the Teacher
                       </h3>
                       <p className="text-sm text-indigo-800">
                          Define your teaching style (Socratic, Narrative, etc.) and your expertise. The AI adapts the output to sound like <em>you</em>.
                       </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                       <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                          <User size={16} /> For the Student
                       </h3>
                       <p className="text-sm text-purple-800">
                          Define their interests (Minecraft, Soccer, etc.) and cognitive style. The AI builds analogies that act as a hook for their brain.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">How to use</h3>
                    <ul className="space-y-3 text-gray-600 text-sm">
                       <li className="flex gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-gray-500">1</div>
                          <p><strong>Set Profiles:</strong> Ensure both the Student Profile (left panel) and Teacher Profile (top bar) are set.</p>
                       </li>
                       <li className="flex gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-gray-500">2</div>
                          <p><strong>Enter Content:</strong> Paste a text excerpt (e.g., a poem) OR type a lesson topic (e.g., "The Water Cycle").</p>
                       </li>
                       <li className="flex gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-gray-500">3</div>
                          <p><strong>Generate:</strong> The AI generates 5 lesson snippets. You can read them, check the "Fit Analysis", or listen via TTS.</p>
                       </li>
                    </ul>
                 </div>
              </div>

              <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
                 <p className="text-xs text-gray-400">
                    Powered by Google Gemini 2.5 Flash & TTS. <br/>
                    Content is generated by AI and should be reviewed for accuracy.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;