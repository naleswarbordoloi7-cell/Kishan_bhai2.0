import { useState, useEffect, useRef, useCallback } from 'react';
import { isSpeechRecognitionSupported } from '../services/webSpeechService';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (options?: UseSpeechRecognitionOptions) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
}

export function useSpeechRecognition(defaultOptions: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const isSupported = isSpeechRecognitionSupported();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>(
    defaultOptions.lang === 'hi' ? 'hi-IN' : defaultOptions.lang || 'en-IN'
  );

  const recognitionRef = useRef<any>(null);
  const continuousRef = useRef<boolean>(defaultOptions.continuous ?? false);
  const optionsRef = useRef(defaultOptions);
  optionsRef.current = defaultOptions;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    (customOptions?: UseSpeechRecognitionOptions) => {
      if (!isSupported) {
        setError('Speech Recognition is not supported on this browser or device.');
        return;
      }

      setError(null);

      // Stop any existing session first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      const lang = customOptions?.lang || selectedLang || 'en-IN';
      const continuous = customOptions?.continuous ?? optionsRef.current.continuous ?? false;
      const interimResults = customOptions?.interimResults ?? optionsRef.current.interimResults ?? true;

      continuousRef.current = continuous;
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0].transcript;
          if (res.isFinal) {
            finalChunk += text;
          } else {
            currentInterim += text;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => {
            const updated = prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim();
            customOptions?.onResult?.(updated, true);
            optionsRef.current.onResult?.(updated, true);
            return updated;
          });
        }

        setInterimTranscript(currentInterim);
        if (currentInterim) {
          customOptions?.onResult?.(currentInterim, false);
          optionsRef.current.onResult?.(currentInterim, false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Web Speech Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permission in browser settings.');
        } else if (event.error === 'no-speech') {
          // No speech detected is standard if farmer paused
          if (!continuousRef.current) {
            setIsListening(false);
          }
        } else {
          setError(`Speech recognition notice: ${event.error}`);
        }
        customOptions?.onError?.(event);
        optionsRef.current.onError?.(event);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        customOptions?.onEnd?.();
        optionsRef.current.onEnd?.();
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (err: any) {
        console.warn('Failed to start speech recognition:', err);
        setError(err.message || 'Could not start voice recognition.');
        setIsListening(false);
      }
    },
    [isSupported, selectedLang]
  );

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    selectedLang,
    setSelectedLang,
  };
}
