import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'lucide-react';
import { AIChatMessage, AIConversationSession, X402PaymentRequirement } from '../../shared/types';
import { AIFarmContextBadge } from '../components/ai/AIFarmContextBadge';
import { AIChatMessageItem } from '../components/ai/AIChatMessageItem';
import { AIQuickPrompts } from '../components/ai/AIQuickPrompts';
import { AIHistoryDrawer } from '../components/ai/AIHistoryDrawer';

export const AIAssistantPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    userRole,
    triggerPaymentModal,
    addToast,
    wallet,
    language,
    setLanguage,
    setCurrentView,
    pendingAiQuery,
    setPendingAiQuery,
  } = useApp();

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.7-flash');
  const [activeSessionId, setActiveSessionId] = useState<string>('sess_wheat_irrigation_01');
  const [sessions, setSessions] = useState<AIConversationSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const initialWelcomeMessage: AIChatMessage = {
    id: 'msg_welcome',
    role: 'assistant',
    modelUsed: 'gemini-3.7-flash',
    language: language || 'en',
    content: language === 'hi'
      ? `🌱 **Recommendation: नमस्ते ${currentUser?.fullName || 'किसान भाई'}! मैं आपका 24/7 स्मार्ट कृषि साथी हूँ**

**Why? (कारण):**
- मैं आपके खेत का स्थान (**${currentUser?.village || 'आनंदपुर'}, गुजरात**), मिट्टी की नमी (**42%**), और मौसम का लाइव डेटा समझता हूँ।
- आपके खेत में कल दोपहर **70% भारी बारिश (14-18 मिमी)** का पूर्वानुमान है।

**What to do (क्या करें):**
1. नीचे दिए गए त्वरित प्रश्नों में से कोई विकल्प चुनें या अपना प्रश्न बोलें/लिखें।
2. पत्तियों में रोग की जांच के लिए फोटो अपलोड करें।
3. प्राकृतिक भाषा में खाद आर्डर, फसल पूल या प्रोफ़ाइल अपडेट करने का निर्देश दें।

⚠️ **Important Warning (महत्वपूर्ण चेतावनी):** डिजिटल सलाह सामान्य निर्णय सहायता के लिए है। कीटनाशक प्रयोग से पहले स्थानीय कृषि विशेषज्ञ की पुष्टि अवश्य करें।`
      : `🌱 **Recommendation: Namaste ${currentUser?.fullName || 'Farmer Brother'}! I am your 24/7 Intelligent Farming Copilot**

**Why?**
- I am connected to your live farm telemetry in **${currentUser?.village || 'Anandpur'}, Gujarat** (${currentUser?.farmSizeAcres || 4.5} Acres).
- Live soil moisture is **42% (Optimal)** and **70% rain is forecasted tomorrow**.

**What to do:**
1. Ask any agronomical question or select one of the 1-click quick scenarios below.
2. Upload a leaf photo for instant computer vision disease diagnosis.
3. Command me to modify your crops, create fertilizer pools, or list harvest lots directly.

⚠️ **Important Warning:** Digital recommendations provide agricultural decision support. Verify specific chemical handling with local agricultural officers.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: [
      'IMD Agro-Meteorological Weather Radar',
      'ICAR Crop Knowledge Repository (ICAR-IIWBR)',
      'Agmarknet APMC Live Mandi Data Feed',
    ],
  };

  const [messages, setMessages] = useState<AIChatMessage[]>([initialWelcomeMessage]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  // Handle pending queries from other dashboards
  useEffect(() => {
    if (pendingAiQuery) {
      const q = pendingAiQuery;
      setPendingAiQuery(null);
      handleSend(q);
    }
  }, [pendingAiQuery]);

  // Voice speech recognition setup
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast(
        'Voice Input Unavailable',
        'Your browser does not support Web Speech Recognition. Please type your query.',
        'info'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        addToast(
          'Listening...',
          language === 'hi' ? 'बोलिए, किसान भाई AI सुन रहा है...' : 'Speak now, Kisan Bhai AI is listening...',
          'info'
        );
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        addToast('Voice Captured', transcript, 'success');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      addToast('Image Attached', 'Crop photo ready for disease diagnosis.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customPrompt?: string, customImage?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    const imageToSend = customImage || selectedImage;

    if (!promptToSend.trim() && !imageToSend) return;

    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: promptToSend || (language === 'hi' ? 'कृपया इस फसल की जांच करें।' : 'Please analyze this crop leaf photo.'),
      imageUrl: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setSelectedImage(null);
    setIsProcessing(true);
    setIsTypingAnimation(true);

    try {
      const base64Data = imageToSend ? imageToSend.split(',')[1] : undefined;

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

      const aiRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          userRole,
          cropContext: currentUser?.crops?.join(', ') || 'Sharbati Wheat, BT Cotton',
          imageBase64: base64Data,
          userId: currentUser?.id,
          modelName: selectedModel,
          language,
          farmContext,
          conversationId: activeSessionId,
        }),
      });

      const aiData = await aiRes.json();

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

      // Check if x402 payment is required for deep analysis
      if (aiData.suggestedPaidService === 'crop-analysis' && imageToSend) {
        const paidRes = await fetch('/api/paid/crop-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cropName: currentUser?.crops?.[0] || 'BT Cotton (Shankar-6)',
            symptoms: promptToSend || 'Foliar discoloration and necrotic lesions',
            imageProvided: true,
          }),
        });

        if (paidRes.status === 402) {
          const x402Data = await paidRes.json();
          const paymentReq: X402PaymentRequirement = x402Data.x402;

          const paymentNoticeMsg: AIChatMessage = {
            id: `msg_pay_${Date.now()}`,
            role: 'assistant',
            modelUsed: selectedModel,
            content: `🌱 **Recommendation: Multispectral Pathogen Diagnosis Required**

**Why?**
- Deep computer vision pathogen identification is an on-chain protected service.
- Settles instantly via **x402 Protocol** on **Algorand Testnet** (Price: **${paymentReq.priceUsdc} USDC**).

**What to do:**
1. Approve the 0.002 USDC micropayment on Algorand Testnet.
2. Receive full pathogen isolation report, foliar dosage, and cluster containment advisory.

⚠️ **Important Warning:** Ensure leaf is clear and well-lit for optimal multispectral precision.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            toolCall: {
              toolName: 'crop_analysis',
              status: 'needs_payment',
              paymentRequirement: paymentReq,
            },
          };

          setMessages((prev) => [...prev, paymentNoticeMsg]);
          setIsProcessing(false);
          setIsTypingAnimation(false);

          triggerPaymentModal(paymentReq, async (proof) => {
            handleExecutePaidService(paymentReq, proof);
          });
          return;
        }
      }

      // Normal response
      const botMsg: AIChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        modelUsed: aiData.modelUsed || selectedModel,
        language: aiData.language || language,
        content: aiData.text,
        executedAction: aiData.executedAction,
        farmingActionCard: aiData.farmingActionCard,
        diseaseAnalysis: aiData.diseaseAnalysis,
        sources: aiData.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      fetchSessions();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          modelUsed: selectedModel,
          content: language === 'hi'
            ? 'क्षमा करें, कनेक्शन में रुकावट आई है। कृपया दोबारा प्रयास करें।'
            : 'I experienced a connection issue. Please verify your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
      setIsTypingAnimation(false);
    }
  };

  const handleExecutePaidService = async (
    req: X402PaymentRequirement,
    proof: { txId: string; sender: string }
  ) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/paid/crop-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': proof.txId,
        },
        body: JSON.stringify({
          cropName: currentUser?.crops?.[0] || 'BT Cotton (Shankar-6)',
          symptoms: 'Leaf yellowing, dark circular fungal spots and marginal chlorosis',
          imageProvided: true,
        }),
      });

      if (res.ok) {
        const resultJson = await res.json();
        const rep = resultJson.result;

        const reportMsg: AIChatMessage = {
          id: `msg_report_${Date.now()}`,
          role: 'assistant',
          modelUsed: selectedModel,
          content: `✅ **x402 Micropayment Settled on Algorand Testnet**
TxID: \`${proof.txId}\`

🌱 **Recommendation: ${rep.diagnosis}**

**Why?**
- Pathogen confidence score: **${rep.confidenceScore}** (Severity: **${rep.severity}**).
- Rapid spread accelerated by 78% ambient relative humidity.

**What to do:**
${rep.remediationPlan.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

⚠️ **Important Warning:** ${rep.clusterAdvisory}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolCall: {
            toolName: 'crop_analysis',
            status: 'paid',
            txId: proof.txId,
            resultData: rep,
          },
          sources: [
            'Algorand Testnet Explorer Verified Tx',
            'ICAR Plant Pathology Protocol',
            'Kishan Bhai Computer Vision Diagnostic Node',
          ],
        };

        setMessages((prev) => [...prev, reportMsg]);
      }
    } catch (err: any) {
      addToast('Settlement Verification Failed', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialWelcomeMessage]);
    addToast('Chat Cleared', 'Starting a clean conversation with Kisan Bhai AI.', 'info');
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

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* 1. Header Banner */}
      <div className="bg-[#2D4F1E] text-white p-5 sm:p-6 rounded-[28px] shadow-xl border border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/15 text-emerald-200 flex items-center justify-center font-bold border border-white/20 backdrop-blur-xs shadow-inner shrink-0">
            <Bot className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-bold font-display text-xl text-white tracking-tight">
                🤖 Kisan Bhai AI (किसान भाई AI)
              </h1>
              <span className="bg-emerald-400/20 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/40 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Online
              </span>
            </div>
            <p className="text-stone-200 text-xs sm:text-sm mt-0.5">
              Your 24/7 intelligent farming partner • Powered by Gemini 3.7 Flash
            </p>
          </div>
        </div>

        {/* Right Action Controls: Language, History, Clear */}
        <div className="flex items-center gap-2 relative z-10 w-full md:w-auto justify-end flex-wrap">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-xs cursor-pointer focus:outline-none"
            >
              {languageOptions.map((opt) => (
                <option key={opt.code} value={opt.code} className="text-stone-900 bg-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conversation History Drawer Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs font-medium text-white border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            title="Conversation History"
          >
            <History className="w-3.5 h-3.5 text-emerald-300" />
            <span>History</span>
            {sessions.length > 0 && (
              <span className="bg-emerald-400 text-emerald-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {sessions.length}
              </span>
            )}
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-xl text-xs text-white border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5 text-stone-300" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* 2. Farm-Aware Context Telemetry Badge */}
      <AIFarmContextBadge currentUser={currentUser} language={language} />

      {/* 3. Quick Action Chips & Scenario Cards */}
      <AIQuickPrompts
        onSelectPrompt={(prompt, sampleImg) => handleSend(prompt, sampleImg)}
        language={language}
      />

      {/* 4. Main Chat Interface Feed */}
      <div className="bg-stone-50/60 backdrop-blur-xl rounded-[28px] border border-stone-200/90 shadow-xs flex flex-col overflow-hidden min-h-[480px]">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-h-[560px]">
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
              <div className="w-9 h-9 rounded-2xl bg-[#2D4F1E] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-emerald-700/30">
                <Bot className="w-5 h-5 text-emerald-200 animate-spin" />
              </div>
              <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs sm:text-sm text-stone-700 flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="font-medium text-stone-600">
                  {language === 'hi' ? 'किसान भाई AI आपके खेत के डेटा का विश्लेषण कर रहा है...' : 'Kisan Bhai AI is reasoning across your farm telemetry...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* 5. Large Bottom AI Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200/80 space-y-2.5">
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

          {/* Large Input Box */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/90 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#2D4F1E]/30 focus-within:border-[#2D4F1E] transition-all shadow-inner">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Attach Image / Disease Scanner */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-stone-500 hover:text-[#2D4F1E] hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
              title="Upload crop photo for disease scan"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-sm'
                  : 'text-stone-500 hover:text-[#2D4F1E] hover:bg-emerald-50'
              }`}
              title="Voice query (Hindi/English)"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                language === 'hi'
                  ? 'किसान भाई से अपने खेत, फसल, मौसम या मंडी भाव के बारे में कुछ भी पूछें...'
                  : 'Ask Kisan Bhai anything about your farm, crops, weather, or mandi prices...'
              }
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none px-2"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isProcessing || (!inputPrompt.trim() && !selectedImage)}
              className="bg-[#2D4F1E] hover:bg-[#233f17] disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
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
    </div>
  );
};
