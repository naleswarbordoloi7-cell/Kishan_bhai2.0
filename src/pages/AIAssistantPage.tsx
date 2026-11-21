import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  Coins,
  Bot,
  UploadCloud,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Cpu,
  History,
  Trash2,
  Paperclip,
  Languages,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  ChevronDown,
  Info,
  Radio,
  BookOpen,
  Brain,
  MoreVertical,
  Settings2,
  TrendingUp,
  Droplets,
  Sprout,
  CloudSun,
  Landmark,
} from 'lucide-react';
import { AIChatMessage, AIConversationSession } from '../../shared/types';
import { AIFarmContextBadge } from '../components/ai/AIFarmContextBadge';
import { AIChatMessageItem } from '../components/ai/AIChatMessageItem';
import { AIQuickPrompts } from '../components/ai/AIQuickPrompts';
import { AIHistoryDrawer } from '../components/ai/AIHistoryDrawer';
import { HandsFreeAssistantModal } from '../components/speech/HandsFreeAssistantModal';
import { FieldVoiceBar } from '../components/speech/FieldVoiceBar';
import { FieldVoiceDictatorModal } from '../components/speech/FieldVoiceDictatorModal';
import { INDIAN_SPEECH_LANGUAGES, isSpeechRecognitionSupported, speakText, stopSpeech } from '../services/webSpeechService';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { uploadFileToStorage } from '../services/storageService';

export const AIAssistantPage: React.FC = () => {
  const { currentUser, setCurrentUser, userRole } = useUserStore();
  const {
    addToast,
    wallet,
    language,
    setLanguage,
    setCurrentView,
    pendingAiQuery,
    setPendingAiQuery,
    addDiaryEntry,
  } = useApp();

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [activeSessionId, setActiveSessionId] = useState<string>('sess_wheat_irrigation_01');
  const [sessions, setSessions] = useState<AIConversationSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHandsFreeOpen, setIsHandsFreeOpen] = useState(false);
  const [isFieldVoiceBarOpen, setIsFieldVoiceBarOpen] = useState(true);
  const [isFieldVoiceModalOpen, setIsFieldVoiceModalOpen] = useState(false);
  const [autoSpeakAnswer, setAutoSpeakAnswer] = useState(true);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [farmMemoryData, setFarmMemoryData] = useState<{ preferences: Record<string, any>; notes: string[] } | null>(null);
  const [speechLanguageCode, setSpeechLanguageCode] = useState<string>(() => {
    const matched = INDIAN_SPEECH_LANGUAGES.find((l) => l.code === language);
    return matched?.speechCode || 'hi-IN';
  });

  const openMemoryModal = async () => {
    setIsMemoryModalOpen(true);
    try {
      const res = await fetch(`/api/ai/memory/${currentUser?.id || 'usr_farmer_ramesh'}`);
      if (res.ok) {
        const data = await res.json();
        setFarmMemoryData(data.memory || { preferences: {}, notes: [] });
      }
    } catch {
      // ignore
    }
  };

  const handleClearMemory = async () => {
    try {
      await fetch(`/api/ai/memory/${currentUser?.id || 'usr_farmer_ramesh'}`, { method: 'DELETE' });
      setFarmMemoryData({ preferences: {}, notes: [] });
      addToast(
        'Farm Memory Cleared',
        language === 'hi' ? 'एआई मेमोरी और प्राथमिकताओं को रीसेट कर दिया गया है।' : 'AI long-term farm memory reset.',
        'info'
      );
    } catch {
      // ignore
    }
  };

  // Keep speech language synchronized with global application language
  useEffect(() => {
    const matched = INDIAN_SPEECH_LANGUAGES.find((l) => l.code === language);
    if (matched) {
      setSpeechLanguageCode(matched.speechCode);
    }
  }, [language]);

  const initialWelcomeMessage: AIChatMessage = {
    id: 'msg_welcome',
    role: 'assistant',
    modelUsed: 'gemini-3.1-flash-lite',
    language: language || 'en',
    content: language === 'hi'
      ? `👋 **नमस्ते ${currentUser?.fullName || 'किसान भाई'}! मैं आपका व्यक्तिगत फार्म एजेंट हूँ।**

आज के लिए आपका **मैनेजमेंट ब्रीफ**:
- आपके खेत (**${currentUser?.village || 'आनंदपुर'}**) में कल **70% भारी बारिश** की संभावना है।
- **सिंचाई स्थगित रखें**: मिट्टी में अभी पर्याप्त नमी (42%) है।
- **मंडी अलर्ट**: आज गोंडल मंडी में कपास के दाम ₹140 बढ़े हैं।

**मैं आपके लिए क्या करूँ?**
- पत्तियों के रोगों की जांच (फोटो भेजें)
- खाद का सामूहिक आर्डर बुक करना
- मशीनरी बुक करना या फार्म डायरी अपडेट करना`
      : `👋 **Namaste ${currentUser?.fullName || 'Farmer Brother'}! I am your Personal Farm Agent.**

Your **Management Brief** for today:
- Live weather for **${currentUser?.village || 'Anandpur'}** shows **70% rain forecasted tomorrow**.
- **Action: Hold Irrigation**. Soil moisture is optimal at 42%.
- **Mandi Intelligence**: Gondal APMC is quoting ₹140 premium for your crop today.

**How can I assist your farm operations today?**
- Diagnose crop issues via photo
- Coordinate collective bulk orders
- Book shared machinery or log field notes`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<AIChatMessage[]>([initialWelcomeMessage]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimVoiceSpeech, setInterimVoiceSpeech] = useState('');
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef<boolean>(false);
  const lastDispatchedRef = useRef<{ key: string; at: number }>({ key: '', at: 0 });

  // Suggested prompt chips above input area to start conversations faster
  const suggestedPromptChips = [
    {
      id: 'crop_health',
      icon: Sprout,
      labelEn: 'Check crop health',
      labelHi: 'फसल स्वास्थ्य जांचें',
      labelGu: 'પાક આરોગ્ય તપાસો',
      query: language === 'hi'
        ? 'मेरी फसल के स्वास्थ्य की जांच करें। क्या कोई रोग या पोषण की कमी के लक्षण हैं?'
        : 'Please check my crop health and advise on any disease or nutrient issues.',
    },
    {
      id: 'market_prices',
      icon: TrendingUp,
      labelEn: 'Market prices today',
      labelHi: 'आज के मंडी भाव',
      labelGu: 'આજના બજાર ભાવ',
      query: language === 'hi'
        ? 'मेरी फसलों के लिए आज के ताजा APMC मंडी भाव और मूल्य रुझान क्या हैं?'
        : "What are today's live APMC mandi prices and market trends for my crops?",
    },
    {
      id: 'irrigation_help',
      icon: Droplets,
      labelEn: 'Help with irrigation',
      labelHi: 'सिंचाई में सहायता',
      labelGu: 'સિંચાઈ સહાય',
      query: language === 'hi'
        ? 'मिट्टी की नमी और बारिश के पूर्वानुमान के अनुसार क्या आज सिंचाई करनी चाहिए?'
        : 'Should I irrigate my crops today based on current soil moisture and weather forecast?',
    },
    {
      id: 'weather_advice',
      icon: CloudSun,
      labelEn: 'Weather advisory',
      labelHi: 'मौसम पूर्वानुमान',
      labelGu: 'હવામાન આગાહી',
      query: language === 'hi'
        ? 'मेरे क्षेत्र के लिए अगले 3 दिनों का मौसम पूर्वानुमान और वर्षा अलर्ट क्या है?'
        : 'What is the 3-day weather forecast and rain advisory for my farm?',
    },
    {
      id: 'govt_schemes',
      icon: Landmark,
      labelEn: 'Govt schemes',
      labelHi: 'सरकारी योजनाएं',
      labelGu: 'સરકારી યોજનાઓ',
      query: language === 'hi'
        ? 'मेरी खेती के लिए कौन-सी सरकारी सब्सिडी व पीएम-किसान योजनाएं उपलब्ध हैं?'
        : 'What government subsidies, PM-Kisan, and welfare schemes are available for my farm?',
    },
  ];

  // Hook for resilient speech recognition with Indian regional fallbacks
  const {
    isSupported: isVoiceSupported,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    activeRecognitionLang,
  } = useSpeechRecognition({
    lang: speechLanguageCode,
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        setInputPrompt((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
        setInterimVoiceSpeech('');
        addToast(
          'Voice Captured',
          text.trim().length > 45 ? `${text.trim().slice(0, 45)}...` : text.trim(),
          'success'
        );
      } else {
        setInterimVoiceSpeech(text);
      }
    },
    onError: (err) => {
      setInterimVoiceSpeech('');
      if (err?.error === 'not-allowed' || err?.error === 'permission-denied') {
        addToast(
          'Microphone Permission Blocked',
          'Please allow microphone permission in your browser address bar to use voice.',
          'error'
        );
      } else if (err?.error === 'no-speech') {
        addToast(
          'No Voice Detected',
          'Please speak closer to the microphone and try again.',
          'info'
        );
      }
    },
    onEnd: () => {
      setInterimVoiceSpeech('');
    },
  });

  // Fetch initial seeded conversation sessions from server
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/ai/sessions');
      if (res.ok) {
        const data = await res.json();
        if (data.sessions && data.sessions.length > 0) {
          setSessions(data.sessions);
        }
      }
    } catch (err) {
      console.warn('Could not load sessions:', err);
    }
  };

  // Scroll to bottom smoothly on message change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isTypingAnimation]);

  // Handle pending queries from other dashboards (guarded against React StrictMode double-invocation)
  const consumedPendingRef = useRef<string | null>(null);
  useEffect(() => {
    if (pendingAiQuery && consumedPendingRef.current !== pendingAiQuery) {
      consumedPendingRef.current = pendingAiQuery;
      const q = pendingAiQuery;
      setPendingAiQuery(null);
      handleSend(q);
    } else if (!pendingAiQuery) {
      consumedPendingRef.current = null;
    }
  }, [pendingAiQuery]);

  // Voice speech recognition toggle with audio interruption & echo prevention
  const toggleVoiceInput = () => {
    // Interrupt and stop any playing audio so microphone doesn't capture speaker echo
    stopSpeech();
    setIsAudioSpeaking(false);

    if (!isVoiceSupported) {
      addToast(
        'Voice Input Unavailable',
        'Web Speech Recognition is not supported on this browser. Please type your query.',
        'info'
      );
      return;
    }

    if (isListening) {
      stopListening();
      setInterimVoiceSpeech('');
    } else {
      // Ensure FieldVoiceBar is closed if we are doing direct input, 
      // or at least stop its listener if it were open.
      resetTranscript();
      setInterimVoiceSpeech('');
      startListening({
        lang: speechLanguageCode,
        continuous: false,
        interimResults: true,
      });
      
      const activeLanguageOption = INDIAN_SPEECH_LANGUAGES.find((l) => l.speechCode === speechLanguageCode);
      const displayLabel = activeLanguageOption ? activeLanguageOption.label : speechLanguageCode;
      
      addToast(
        'Listening...',
        language === 'hi'
          ? 'बोलिए, मैं सुन रहा हूँ...'
          : `Listening in ${displayLabel}...`,
        'info'
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Display image immediately for prompt preview
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      addToast('Image Attached', 'Crop photo ready for disease diagnosis.', 'info');
    };
    reader.readAsDataURL(file);

    // Save copy in Firebase Storage production bucket
    uploadFileToStorage(file, 'chat-attachments').catch((err) => {
      console.warn('Firebase Storage chat attachment background save:', err);
    });
  };

  const handleSend = async (customPrompt?: string, customImage?: string): Promise<string | undefined> => {
    const promptToSend = (customPrompt !== undefined ? customPrompt : inputPrompt).trim();
    const imageToSend = customImage || selectedImage;

    if (!promptToSend && !imageToSend) return undefined;

    // Synchronous lock prevents duplicate sends from double-clicks, Enter repeats, or StrictMode remounts
    const dispatchKey = `${promptToSend}::${imageToSend ? imageToSend.slice(0, 48) : ''}`;
    const nowMs = Date.now();
    if (
      isSendingRef.current ||
      (lastDispatchedRef.current.key === dispatchKey && nowMs - lastDispatchedRef.current.at < 1500)
    ) {
      return undefined;
    }

    isSendingRef.current = true;
    lastDispatchedRef.current = { key: dispatchKey, at: nowMs };

    // Halt active speech immediately when sending new query
    stopSpeech();
    setIsAudioSpeaking(false);

    const uniqueSuffix = Math.random().toString(36).slice(2, 7);
    const userMsg: AIChatMessage = {
      id: `msg_u_${nowMs}_${uniqueSuffix}`,
      role: 'user',
      content: promptToSend || (language === 'hi' ? 'कृपया इस फसल की जांच करें।' : 'Please analyze this crop leaf photo.'),
      imageUrl: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => (prev.some((m) => m.id === userMsg.id) ? prev : [...prev, userMsg]));
    setInputPrompt('');
    setSelectedImage(null);
    setInterimVoiceSpeech('');
    setIsProcessing(true);
    setIsTypingAnimation(true);

    try {
      let base64Data: string | undefined;
      let imageMimeType: string | undefined;
      if (imageToSend) {
        const dataUrlMatch = imageToSend.match(/^data:([^;,]+)(;[^,]*)?,([\s\S]*)$/i);
        if (dataUrlMatch) {
          const parsedMime = dataUrlMatch[1].trim().toLowerCase();
          const isBase64 = (dataUrlMatch[2] || '').toLowerCase().includes('base64');
          if (isBase64 && parsedMime !== 'image/svg+xml') {
            imageMimeType = parsedMime === 'image/jpg' ? 'image/jpeg' : parsedMime;
            base64Data = dataUrlMatch[3].trim();
          }
        } else {
          base64Data = imageToSend;
          imageMimeType = 'image/jpeg';
        }
      }

      const farmContext = {
        farmerName: currentUser?.fullName || 'Ramesh Patel',
        village: currentUser?.village || 'Anandpur',
        state: currentUser?.state || 'Gujarat',
        farmSizeAcres: currentUser?.farmSizeAcres || 4.5,
        crops: currentUser?.crops || ['Cotton (Bt)', 'Sharbati Wheat'],
        soilMoisture: 42,
        weather: {
          temperatureC: 29.5,
          rainfallProbability: 70,
          condition: 'Partly Cloudy with 70% Rain',
        },
      };

      const controller = new AbortController();
      const requestTimeout = setTimeout(() => controller.abort(), 28000);

      let aiRes: Response;
      try {
        aiRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            prompt: promptToSend,
            userRole,
            cropContext: currentUser?.crops?.join(', ') || 'Sharbati Wheat, BT Cotton',
            imageBase64: base64Data,
            imageMimeType,
            userId: currentUser?.id,
            modelName: selectedModel,
            language,
            farmContext,
            conversationId: activeSessionId,
            history: messages.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
      } finally {
        clearTimeout(requestTimeout);
      }

      const aiData = await aiRes.json().catch(() => ({} as any));

      if (!aiRes.ok) {
        const errorDetail =
          aiData?.error ||
          aiData?.message ||
          (aiRes.status === 429
            ? language === 'hi'
              ? 'बहुत अधिक अनुरोध भेजे गए हैं। कृपया कुछ सेकंड प्रतीक्षा करें।'
              : 'Too many requests in a minute. Please wait a few seconds and try again.'
            : language === 'hi'
              ? 'AI सेवा से उत्तर प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
              : 'Unable to reach Kishan AI right now. Please try again.');
        addToast('Kishan AI Notice', errorDetail, 'error');
        const errBotMsg: AIChatMessage = {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          modelUsed: selectedModel,
          language,
          content: errorDetail,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errBotMsg]);
        return errorDetail;
      }

      // If an autonomous app state modification was executed, update app state immediately
      if (aiData.executedAction) {
        if (aiData.executedAction.actionType === 'PROFILE_UPDATED' && aiData.executedAction.modifiedData) {
          setCurrentUser(aiData.executedAction.modifiedData);
          localStorage.setItem('kb_user', JSON.stringify(aiData.executedAction.modifiedData));
          addToast('Profile Synchronized', 'Your profile updates are active across Kisan Bhai.', 'success');
        } else if (aiData.executedAction.actionType === 'BULK_ORDER_CREATED') {
          addToast('Cluster Demand Added', 'New group purchase order created for cluster.', 'success');
        } else if (aiData.executedAction.actionType === 'HARVEST_LOT_POOLED') {
          addToast('Harvest Pooled', 'Harvest lot listed for institutional buyer bids.', 'success');
        } else if (aiData.executedAction.actionType === 'MACHINERY_BOOKED') {
          addToast('Machinery Reserved', 'Equipment slot confirmed for your farm.', 'success');
        }
      }

      const safeReplyText =
        (typeof aiData.text === 'string' && aiData.text.trim()) ||
        (typeof aiData.reply === 'string' && aiData.reply.trim()) ||
        (language === 'hi'
          ? 'आपके प्रश्न का विश्लेषण पूरा हो गया है। कृपया नीचे दिए गए सुझाव देखें।'
          : 'Your farm query has been analyzed. Please review the advisory details below.');

      // Normal response (including Gemini Vision disease diagnosis when an image was attached)
      const botMsg: AIChatMessage = {
        id: `msg_bot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        modelUsed: aiData.modelUsed || selectedModel,
        language: aiData.language || language,
        content: safeReplyText,
        executedAction: aiData.executedAction,
        farmingActionCard: aiData.farmingActionCard,
        diseaseAnalysis: aiData.diseaseAnalysis,
        sources: aiData.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => (prev.some((m) => m.id === botMsg.id) ? prev : [...prev, botMsg]));
      fetchSessions();

      // Read answer aloud if hands-free speech response is active
      if (autoSpeakAnswer && safeReplyText) {
        setIsAudioSpeaking(true);
        speakText(safeReplyText, {
          lang: speechLanguageCode,
          onEnd: () => setIsAudioSpeaking(false),
          onError: () => setIsAudioSpeaking(false),
        });
      }

      return safeReplyText;
    } catch (err: any) {
      const errMsg = language === 'hi'
        ? 'क्षमा करें, कनेक्शन में रुकावट आई है। कृपया दोबारा प्रयास करें।'
        : 'I experienced a connection issue. Please verify your connection and try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          modelUsed: selectedModel,
          content: errMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return errMsg;
    } finally {
      isSendingRef.current = false;
      setIsProcessing(false);
      setIsTypingAnimation(false);
    }
  };

  const handleSaveVoiceDiaryNote = (note: {
    category: string;
    crop: string;
    title: string;
    expenseAmountInr?: number;
    revenueAmountInr?: number;
    notes: string;
  }) => {
    addDiaryEntry({
      date: new Date().toISOString().split('T')[0],
      category: note.category,
      crop: note.crop || currentUser?.crops?.[0] || 'BT Cotton',
      title: note.title,
      expenseAmountInr: note.expenseAmountInr,
      revenueAmountInr: note.revenueAmountInr,
      notes: note.notes,
    });

    const isHi = language === 'hi';
    const noteMsg: AIChatMessage = {
      id: `msg_note_${Date.now()}`,
      role: 'assistant',
      modelUsed: 'Field Voice Recorder',
      language,
      content: isHi
        ? `📝 **खेत डायरी में सुरक्षित (Hands-Free Note Recorded):**\n- **गतिविधि / शीर्षक:** ${note.title}\n- **श्रेणी:** ${note.category} | **फसल:** ${note.crop || 'BT Cotton'}\n${note.expenseAmountInr ? `- **दर्ज खर्च:** ₹${note.expenseAmountInr.toLocaleString('en-IN')}\n` : ''}${note.revenueAmountInr ? `- **दर्ज आय:** ₹${note.revenueAmountInr.toLocaleString('en-IN')}\n` : ''}- **विवरण:** ${note.notes}\n\n✅ यह प्रविष्टि आपके **डिजिटल फार्म लेजर (Farm Diary)** में सफलतापूर्वक जोड़ दी गई है।`
        : `📝 **Hands-Free Farm Diary Entry Recorded:**\n- **Activity / Title:** ${note.title}\n- **Category:** ${note.category} | **Crop:** ${note.crop || 'BT Cotton'}\n${note.expenseAmountInr ? `- **Logged Expense:** ₹${note.expenseAmountInr.toLocaleString('en-IN')}\n` : ''}${note.revenueAmountInr ? `- **Logged Revenue:** ₹${note.revenueAmountInr.toLocaleString('en-IN')}\n` : ''}- **Details:** ${note.notes}\n\n✅ Stored in your **Digital Farm Ledger & Activity Log**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, noteMsg]);
  };

  const handleClearChat = () => {
    stopSpeech();
    setIsAudioSpeaking(false);
    setMessages([initialWelcomeMessage]);
    setInputPrompt('');
    setSelectedImage(null);
    setInterimVoiceSpeech('');
    addToast('Chat Cleared', 'Starting a clean conversation with Kishan Bhai AI.', 'info');
  };

  const handleSelectSession = (session: AIConversationSession) => {
    setActiveSessionId(session.id);
    const convertedMsgs: AIChatMessage[] = session.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      imageUrl: m.imageBase64,
      timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: m.sources,
      farmingActionCard: m.actionCard,
      diseaseAnalysis: m.diseaseAnalysis,
      executedAction: m.executedAction,
    }));
    setMessages(convertedMsgs);
    addToast('Conversation Restored', session.title, 'success');
  };

  const handleNewChat = () => {
    const newId = `sess_${Date.now()}`;
    setActiveSessionId(newId);
    setMessages([initialWelcomeMessage]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/ai/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
      addToast('Session Deleted', 'Conversation removed from history.', 'info');
    } catch (err) {
      console.warn('Could not delete session:', err);
    }
  };

  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: type } : m))
    );
    addToast(
      type === 'like' ? 'Feedback Recorded 👍' : 'Feedback Recorded 👎',
      type === 'like'
        ? 'Thank you! Your feedback helps optimize agronomical accuracy.'
        : 'Thank you! We will refine future farming recommendations.',
      'info'
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-4">
      {/* 1. Header Banner */}
      {/* 1. Refined Header Banner */}
      <div className="bg-emerald-900 dark:bg-[#0A1A0F] text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden">
        {/* Left Title & Status */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center border border-white/10 backdrop-blur-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold font-display text-xl text-white tracking-tight">
                Kishan Bhai Agent
              </h1>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <p className="text-emerald-400/70 text-[11px] font-bold uppercase tracking-widest mt-0.5">
              Dedicated Farm Management Agent
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
          {/* Voice Command Group */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setIsHandsFreeOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Radio className="w-3 h-3" />
              <span>{language === 'hi' ? 'बोलकर पूछें' : 'Hands-Free'}</span>
            </button>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-1.5 transition-all cursor-pointer rounded-xl ml-0.5 ${
                isListening ? 'text-rose-500 animate-pulse' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Utilities */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-1 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="History"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={openMemoryModal}
              className="p-1 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Farm Memory"
            >
              <Brain className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearChat}
              className="p-1 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Farm-Aware Context Telemetry Badge */}
      <AIFarmContextBadge currentUser={currentUser} language={language} />

      {/* 3. Quick Action Chips & Scenario Cards */}
      <AIQuickPrompts
        onSelectPrompt={(prompt, sampleImg) => handleSend(prompt, sampleImg)}
        language={language}
        disabled={isProcessing}
      />

      {/* 4. Main Chat Interface Feed */}
      <div className="bg-stone-50/60 backdrop-blur-xl rounded-2xl border border-stone-200/90 shadow-xs flex flex-col overflow-hidden min-h-[480px]">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-3 sm:space-y-4 max-h-[600px] custom-scrollbar">
          {messages.map((msg) => (
            <AIChatMessageItem
              key={msg.id}
              message={msg}
              onRegenerate={(prompt) => handleSend(prompt)}
              onNavigateView={(view) => setCurrentView(view)}
              onFeedback={handleFeedback}
              language={language}
            />
          ))}

          {/* Typing Animation Indicator */}
          {isProcessing && (
            <div className="flex gap-3.5 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-emerald-700/30">
                <Bot className="w-4 h-4 text-emerald-200 animate-spin" />
              </div>
              <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs sm:text-sm text-stone-700 flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="font-medium text-stone-600">
                  {language === 'hi' ? 'किशन भाई AI आपके खेत के डेटा का विश्लेषण कर रहा है...' : 'Kishan Bhai AI is reviewing your farm details...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* 5. Large Bottom AI Input Area */}
        <div className="p-2.5 sm:p-4 bg-white border-t border-stone-200/80 space-y-2">
          {/* Audio Speaking Out Loud Banner */}
          {isAudioSpeaking && (
            <div className="flex items-center justify-between gap-2 bg-emerald-950 text-emerald-200 border border-emerald-600/70 px-3.5 py-2 rounded-xl text-xs animate-in fade-in">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="font-semibold">
                  {language === 'hi'
                    ? 'कृषि सलाह बोलकर सुनाई जा रही है...'
                    : 'Reading agronomic recommendation aloud...'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setIsAudioSpeaking(false);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
              >
                {language === 'hi' ? 'आवाज रोकें ⏹️' : 'Stop Audio ⏹️'}
              </button>
            </div>
          )}

          {/* Hands-Free Field Voice-to-Text Bar */}
          {isFieldVoiceBarOpen && (
            <FieldVoiceBar
              isOpen={isFieldVoiceBarOpen}
              onToggleOpen={() => setIsFieldVoiceBarOpen(false)}
              onSendQuery={async (query) => {
                await handleSend(query);
              }}
              onSaveDiaryNote={handleSaveVoiceDiaryNote}
              language={language}
              selectedDialect={speechLanguageCode}
              onDialectChange={(code) => setSpeechLanguageCode(code)}
              defaultCrop={currentUser?.crops?.[0] || 'BT Cotton'}
              isProcessingQuery={isProcessing}
              autoSpeakAnswer={autoSpeakAnswer}
              onToggleAutoSpeak={(enabled) => setAutoSpeakAnswer(enabled)}
            />
          )}

          {/* Selected Image Thumbnail Preview */}
          {selectedImage && (
            <div className="flex items-center gap-3 bg-stone-100 p-2 rounded-xl border border-stone-200/80 w-fit">
              <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
              <div className="text-xs">
                <div className="font-bold text-stone-800">Crop leaf photo attached</div>
                <div className="text-stone-500 text-[10px]">Ready for computer vision analysis</div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Live Interim Speech Preview Banner */}
          {interimVoiceSpeech && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-300/80 px-3.5 py-2 rounded-xl text-xs animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0"></span>
              <span className="font-semibold text-emerald-800 shrink-0">
                {language === 'hi' ? 'सुनाई दे रहा है:' : 'Hearing:'}
              </span>
              <span className="italic text-emerald-900 truncate">"{interimVoiceSpeech}"</span>
            </div>
          )}

          {/* Row of Suggested Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 dark:text-stone-500 shrink-0 uppercase tracking-wider pl-0.5 select-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{language === 'hi' ? 'त्वरित सुझाव:' : language === 'gu' ? 'સૂચનો:' : 'Suggested:'}</span>
            </div>
            {suggestedPromptChips.map((chip) => {
              const Icon = chip.icon;
              const label = language === 'hi' ? chip.labelHi : language === 'gu' ? chip.labelGu : chip.labelEn;
              return (
                <button
                  key={chip.id}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSend(chip.query)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-emerald-50 dark:bg-stone-800/90 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-stone-200/90 dark:border-stone-700/80 whitespace-nowrap transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
                  title={chip.query}
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Beautiful Focused Input Box */}
          <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-2xl p-1.5 sm:p-2 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-600 transition-all shadow-sm">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-1">
              {/* Attach Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer shrink-0"
                title="Upload crop photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Voice Input */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-md animate-pulse'
                    : 'text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
                title={isListening ? "Stop Listening" : "Voice Query"}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'scale-110' : ''}`} />
              </button>
            </div>

            {/* Text Input */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.repeat && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                language === 'hi'
                  ? 'खेत, फसल या मंडी भाव के बारे में पूछें...'
                  : 'Ask about crops, soil, weather, or mandi prices...'
              }
              className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none px-2"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isProcessing || (!inputPrompt.trim() && !selectedImage)}
              className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-30 disabled:grayscale text-white p-3 rounded-xl font-bold transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm shadow-emerald-900/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-emerald-600" />
              <span>Ground-truth: ICAR knowledge repository & live sensor radar</span>
            </span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>

      {/* 6. Conversation History Drawer */}
      <AIHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        language={language}
      />

      {/* 7. Fullscreen Continuous Hands-Free Voice Assistant Modal */}
      <HandsFreeAssistantModal
        isOpen={isHandsFreeOpen}
        onClose={() => setIsHandsFreeOpen(false)}
        language={language}
        farmerName={currentUser?.fullName || 'Farmer Brother'}
        crops={currentUser?.crops || ['BT Cotton', 'Sharbati Wheat']}
        village={currentUser?.village || 'Anandpur'}
        onSendQuery={async (query) => {
          const res = await handleSend(query);
          return res || 'Processed your farm query.';
        }}
      />

      {/* 8. Voice Farm Diary Dictator Modal */}
      <FieldVoiceDictatorModal
        isOpen={isFieldVoiceModalOpen}
        onClose={() => setIsFieldVoiceModalOpen(false)}
        language={language}
        defaultCrop={currentUser?.crops?.[0] || 'BT Cotton'}
        onSaveEntry={(entry) => {
          handleSaveVoiceDiaryNote({
            category: entry.category,
            crop: entry.crop,
            title: entry.title,
            expenseAmountInr: entry.expenseAmountInr,
            notes: entry.notes,
          });
        }}
      />

      {/* 9. Farm Memory Review & Management Modal */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-base text-white">
                    {language === 'as' ? 'ফাৰ্ম স্মৃতি আৰু পছন্দসমূহ' : language === 'hi' ? 'खेत मेमोरी व प्राथमिकताएं' : 'Farm Memory & Preferences'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {language === 'as'
                      ? 'আপোনাৰ সন্মতি সাপেক্ষে এআই-য়ে মনত ৰখা তথ্য'
                      : language === 'hi'
                      ? 'आपकी सहमति से एआई द्वारा याद रखी गई कृषि जानकारी'
                      : 'Saved recurring farm details remembered across sessions'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMemoryModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-950/80 p-3 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-400 font-medium">Farmer:</span>
                  <span className="font-bold text-white">{currentUser?.fullName || 'Ramesh Patel'}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-400 font-medium">Village & Location:</span>
                  <span className="font-bold text-emerald-300">{currentUser?.village || 'Anandpur'}, Gujarat</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-400 font-medium">Landholding:</span>
                  <span className="font-bold text-white">{currentUser?.farmSizeAcres || 4.5} Acres (Medium Black Loam)</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span className="text-stone-400 font-medium">Crops Cultivated:</span>
                  <span className="font-bold text-amber-300">{currentUser?.crops?.join(', ') || 'Wheat, Cotton'}</span>
                </div>
              </div>

              {farmMemoryData?.notes && farmMemoryData.notes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Recorded Farm Observations:</span>
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-stone-950/60 p-2.5 rounded-xl border border-white/5">
                    {farmMemoryData.notes.map((note, i) => (
                      <p key={i} className="text-[11px] text-stone-300">• {note}</p>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-stone-400 leading-relaxed">
                {language === 'as'
                  ? 'এই তথ্যই কিষাণ ভাই এআইক আপোনাৰ প্ৰশ্নৰ বাবে নিখুঁত আৰু ক্ষিপ্ৰ পৰামৰ্শ দিবলৈ সহায় কৰে।'
                  : language === 'hi'
                  ? 'यह जानकारी किसान भाई AI को आपके खेत के लिए सटीक व त्वरित सलाह प्रदान करने में सहायता करती है।'
                  : 'This memory enables Kishan Bhai AI to answer follow-up questions seamlessly without repetitive queries.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleClearMemory}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'as' ? 'মেমোৰি মচক' : language === 'hi' ? 'मेमोरी मिटाएं' : 'Clear Saved Memory'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMemoryModalOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                {language === 'as' ? 'সম্পূৰ্ণ' : language === 'hi' ? 'पूर्ण' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
