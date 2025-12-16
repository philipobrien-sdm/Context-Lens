import React, { useState } from 'react';
import { ReframingCard as ReframingCardType, StudentProfile } from '../types';
import { generateSpeech } from '../services/geminiService';
import { Play, Pause, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  card: ReframingCardType;
  profile: StudentProfile;
}

const ReframingCard: React.FC<Props> = ({ card, profile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

  const handlePlayAudio = async () => {
    if (isPlaying && audioSource) {
      audioSource.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      // Lazy load audio context
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      const buffer = await generateSpeech(card.reframedText, profile.voicePreference);
      
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        setAudioSource(source);
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const chartData = [
    { name: 'Cultural', value: card.analysis.culturalResonance, color: '#8884d8' },
    { name: 'Cognitive', value: card.analysis.cognitiveFit, color: '#82ca9d' },
    { name: 'Vocab', value: card.analysis.vocabularyComplexity, color: '#ffc658' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-100">
        <h3 className="font-bold text-lg text-indigo-900 line-clamp-2">{card.title}</h3>
      </div>
      
      <div className="p-5 flex-grow">
        <div className="prose prose-sm max-w-none text-gray-700 mb-6">
          <p className="whitespace-pre-line leading-relaxed">{card.reframedText}</p>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-6">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Reflection</span>
              <p className="text-sm text-amber-900 italic mt-1">"{card.reflectionQuestion}"</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
             <div className="h-24 w-full">
                <p className="text-[10px] text-gray-400 font-medium mb-1 uppercase text-center">Contextual Metrics</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="flex flex-col justify-end">
               <button
                  onClick={handlePlayAudio}
                  disabled={isLoadingAudio}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isPlaying 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {isLoadingAudio ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" /> Stop Reading
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Read Aloud
                    </>
                  )}
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ReframingCard;
