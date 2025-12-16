import React, { useState } from 'react';
import { StudentProfile, CognitiveStyle } from '../types';
import { AVAILABLE_VOICES } from '../constants';
import { Plus, Trash2, User, Check, Edit2, X, AlertTriangle, Settings, ChevronRight, Users } from 'lucide-react';

interface ProfileManagerProps {
  profiles: StudentProfile[];
  currentProfile: StudentProfile | null;
  onSelectProfile: (profile: StudentProfile) => void;
  onSaveProfile: (profile: StudentProfile) => void;
  onDeleteProfile: (id: string) => void;
}

type ViewMode = 'idle' | 'manage' | 'edit';

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  currentProfile,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('idle');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState<StudentProfile>({
    id: '',
    name: '',
    age: 12,
    nativeLanguage: '',
    culture: '',
    cognitiveStyle: CognitiveStyle.VISUAL,
    interests: [],
    voicePreference: 'Puck',
    library: []
  });

  const handleAddNew = () => {
    setEditForm({
      id: Date.now().toString(),
      name: 'New Student',
      age: 12,
      nativeLanguage: 'English',
      culture: 'General',
      cognitiveStyle: CognitiveStyle.VISUAL,
      interests: [],
      voicePreference: 'Puck',
      library: []
    });
    setViewMode('edit');
  };

  const handleEdit = (e: React.MouseEvent, profile: StudentProfile) => {
    e.stopPropagation();
    setEditForm({ ...profile });
    setViewMode('edit');
  };

  const handleSave = () => {
    onSaveProfile(editForm);
    onSelectProfile(editForm);
    setViewMode('idle');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      onDeleteProfile(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const handleSelectAndClose = (profile: StudentProfile) => {
    onSelectProfile(profile);
    setViewMode('idle');
  };

  // Compact Active Profile Banner
  if (viewMode === 'idle') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-4 mb-8 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {currentProfile ? (
            <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-full text-indigo-600 shadow-inner">
                <User size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-lg text-gray-900 leading-none">
                    {currentProfile.name}
                  </h2>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                    {currentProfile.age}y
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    {currentProfile.nativeLanguage}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    {currentProfile.cognitiveStyle.split('/')[0]}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-gray-100 p-3 rounded-full text-gray-400">
                <User size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-400">No Profile Selected</h2>
                <p className="text-sm text-gray-400">Select or create a learner profile to begin.</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setViewMode('manage')}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-95 w-full md:w-auto justify-center"
          >
            <Users size={18} />
            {currentProfile ? 'Switch Profile' : 'Select Profile'}
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background overlay is implied by the fixed modals below covering the screen */}
       <div className="h-0" /> 

      {/* Manage Profiles Modal */}
      {viewMode === 'manage' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="text-xl font-bold text-indigo-900">Learner Profiles</h3>
                <p className="text-sm text-gray-500">Select a student to adapt content for</p>
              </div>
              <button 
                onClick={() => setViewMode('idle')}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Add New Card */}
               <button
                  onClick={handleAddNew}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all group min-h-[140px]"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <span className="font-semibold text-indigo-700">Create New Profile</span>
                </button>

                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectAndClose(profile)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative group flex flex-col justify-between hover:shadow-md ${
                      currentProfile?.id === profile.id
                        ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    {currentProfile?.id === profile.id && (
                      <div className="absolute top-3 right-3 text-indigo-600 bg-white rounded-full p-0.5 shadow-sm">
                        <Check size={16} />
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {profile.name}
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                          {profile.age}y
                        </span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{profile.culture}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                       <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                         {profile.cognitiveStyle.split('/')[0]}
                       </span>
                       <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                              onClick={(e) => handleEdit(e, profile)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, profile.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                       </div>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-center text-xs text-gray-400">
              {profiles.length} profiles available
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {viewMode === 'edit' && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-indigo-900">
                {editForm.id && profiles.find(p => p.id === editForm.id) ? 'Edit Profile' : 'New Profile'}
              </h3>
              <button 
                onClick={() => setViewMode('manage')}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="Student Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Native Language</label>
                    <input
                      type="text"
                      value={editForm.nativeLanguage}
                      onChange={(e) => setEditForm({ ...editForm, nativeLanguage: e.target.value })}
                      className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="e.g. Spanish"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Culture/Background</label>
                    <input
                      type="text"
                      value={editForm.culture}
                      onChange={(e) => setEditForm({ ...editForm, culture: e.target.value })}
                      className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="e.g. Urban Mexican"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cognitive Style</label>
                    <select
                      value={editForm.cognitiveStyle}
                      onChange={(e) => setEditForm({ ...editForm, cognitiveStyle: e.target.value as CognitiveStyle })}
                      className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white"
                    >
                      {Object.values(CognitiveStyle).map((style) => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Voice Preference</label>
                    <select
                      value={editForm.voicePreference}
                      onChange={(e) => setEditForm({ ...editForm, voicePreference: e.target.value })}
                      className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white"
                    >
                      {AVAILABLE_VOICES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Interests (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.interests.join(', ')}
                      onChange={(e) => setEditForm({ ...editForm, interests: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="e.g. Minecraft, Cooking, Soccer"
                    />
                  </div>
                </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setViewMode('manage')} 
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Back to List
              </button>
              <button 
                onClick={handleSave} 
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                Save & Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
         <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
               <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-short">
                     <AlertTriangle className="text-red-600 h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Profile?</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                     Are you sure you want to delete this profile? <br/>This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-center">
                     <button
                        onClick={() => setDeleteConfirmationId(null)}
                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 w-full"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={confirmDelete}
                        className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-md transition-all w-full"
                     >
                        Delete
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default ProfileManager;