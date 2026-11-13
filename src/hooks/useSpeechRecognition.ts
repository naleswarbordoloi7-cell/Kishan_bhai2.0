import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isSpeechRecognitionSupported,
  getSupportedRecognitionCodes,
} from '../services/webSpeechService';

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
  activeRecognitionLang: string;
}

export function useSpeechRecognition(defaultOptions: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const isSupported = isSpeechRecognitionSupported();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>(
    defaultOptions.lang || 'en-IN'
  );
  const [activeRecognitionLang, setActiveRecognitionLang] = useState<string>('en-IN');

  // Helper to safely update state outside of render cycle
  const safeSetState = useCallback((setter: any, value: any) => {
    setTimeout(() => setter(value), 0);
  }, []);

  const recognitionRef = useRef<any>(null);
  const continuousRef = useRef<boolean>(defaultOptions.continuous ?? false);
  const optionsRef = useRef(defaultOptions);
  optionsRef.current = defaultOptions;

  const candidateLangsRef = useRef<string[]>([]);
  const currentLangIndexRef = useRef<number>(0);
  const isExplicitStopRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isExplicitStopRef.current = true;
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
    safeSetState(setTranscript, '');
    safeSetState(setInterimTranscript, '');
    safeSetState(setError, null);
  }, [safeSetState]);

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    safeSetState(setInterimTranscript, '');
  }, [safeSetState]);

  const startListeningWithCode = useCallback(
    (langIndex: number, customOptions?: UseSpeechRecognitionOptions) => {
      if (!isSupported) {
        safeSetState(setError, 'Speech Recognition is not supported on this browser or device. Please type your query.');
        return;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        safeSetState(setError, 'Speech Recognition API is unavailable in this environment.');
        return;
      }

      if (langIndex >= candidateLangsRef.current.length) {
        safeSetState(setError, 'Voice recognition language not supported by browser. Falling back to typing.');
        safeSetState(setIsListening, false);
        return;
      }

      const activeCode = candidateLangsRef.current[langIndex] || 'en-IN';
      currentLangIndexRef.current = langIndex;
      safeSetState(setActiveRecognitionLang, activeCode);

      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      try {
        const recognition = new SpeechRecognition();
        const continuous = customOptions?.continuous ?? optionsRef.current.continuous ?? false;
        const interimResults = customOptions?.interimResults ?? optionsRef.current.interimResults ?? true;

        continuousRef.current = continuous;
        recognition.lang = activeCode;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          // Wrap in setTimeout to ensure state update doesn't happen during render
          setTimeout(() => {
            setIsListening(true);
            setError(null);
          }, 0);
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
              // Schedule side-effect callbacks outside of the state updater function
              setTimeout(() => {
                customOptions?.onResult?.(updated, true);
                optionsRef.current.onResult?.(updated, true);
              }, 0);
              return updated;
            });
          }

          safeSetState(setInterimTranscript, currentInterim);
          if (currentInterim) {
            // Similarly wrap interim results to be safe, though they aren't in an updater here
            setTimeout(() => {
              customOptions?.onResult?.(currentInterim, false);
              optionsRef.current.onResult?.(currentInterim, false);
            }, 0);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Web Speech Recognition event notice:', event.error, 'Language attempted:', activeCode);

          if (event.error === 'language-not-supported' || event.error === 'bad-grammar') {
            // Attempt next fallback dialect in priority list
            const nextIndex = currentLangIndexRef.current + 1;
            if (nextIndex < candidateLangsRef.current.length) {
              console.info(`Switching speech recognition from ${activeCode} to fallback ${candidateLangsRef.current[nextIndex]}`);
              startListeningWithCode(nextIndex, customOptions);
              return;
            }
          }

          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            setTimeout(() => {
              setError('Microphone access was denied. Please allow microphone permission in your browser address bar.');
              setIsListening(false);
            }, 0);
          } else if (event.error === 'no-speech') {
            if (!continuousRef.current) {
              setTimeout(() => {
                setIsListening(false);
                setError('No voice detected. Please speak closer to the microphone and try again.');
              }, 0);
            }
          } else if (event.error === 'network') {
            setTimeout(() => {
              setError('Speech recognition network timeout. Please check your internet connection or type your question.');
              setIsListening(false);
            }, 0);
          } else if (event.error !== 'aborted') {
            setTimeout(() => {
              setError(`Voice recognition notice: ${event.error}`);
              setIsListening(false);
            }, 0);
          }

          setTimeout(() => {
            customOptions?.onError?.(event);
            optionsRef.current.onError?.(event);
          }, 0);
        };

        recognition.onend = () => {
          if (!isExplicitStopRef.current && continuousRef.current) {
            // In continuous mode, restart if closed by browser silence timeout
            try {
              recognition.start();
              return;
            } catch {
              // ignore
            }
          }
          setTimeout(() => {
            setIsListening(false);
            setInterimTranscript('');
            customOptions?.onEnd?.();
            optionsRef.current.onEnd?.();
          }, 0);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.warn('Failed to start speech recognition:', err);
        const nextIndex = currentLangIndexRef.current + 1;
        if (nextIndex < candidateLangsRef.current.length) {
          startListeningWithCode(nextIndex, customOptions);
        } else {
            safeSetState(setError, err.message || 'Could not start voice recognition.');
            safeSetState(setIsListening, false);
        }
      }
    },
    [isSupported]
  );

  const startListening = useCallback(
    (customOptions?: UseSpeechRecognitionOptions) => {
      isExplicitStopRef.current = false;
      safeSetState(setError, null);

      const targetLang = customOptions?.lang || selectedLang || 'en-IN';
      const candidateCodes = getSupportedRecognitionCodes(targetLang);
      candidateLangsRef.current = candidateCodes;

      startListeningWithCode(0, customOptions);
    },
    [selectedLang, startListeningWithCode]
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
    activeRecognitionLang,
  };
}
