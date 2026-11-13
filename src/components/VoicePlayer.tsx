import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VoicePlayerProps {
  text: string;
  lang?: string;
  className?: string;
  label?: string;
  stopLabel?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  text,
  lang = 'hi',
  className = '',
  label = 'Listen Answer',
  stopLabel = 'Stop Listening',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (!text?.trim()) return;

    try {
      setIsLoading(true);

      // Attempt ElevenLabs streaming TTS endpoint
      const response = await fetch('/api/speech/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('audio')) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
          setIsPlaying(true);
          return;
        }
      }

      // Fallback to client-side Web Speech API if ElevenLabs API key is not configured or fails
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : lang === 'gu' ? 'gu-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn('ElevenLabs API fallback triggered to Web Speech:', error);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : lang === 'gu' ? 'gu-IN' : 'en-IN';
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={handlePlayVoice}
        disabled={isLoading || !text?.trim()}
        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-all active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
        aria-label={isPlaying ? stopLabel : label}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="w-5 h-5 text-amber-200" />
        ) : (
          <Volume2 className="w-5 h-5 text-emerald-100" />
        )}
        <span>{isPlaying ? stopLabel : label}</span>
      </button>
    </div>
  );
};
export default VoicePlayer;
