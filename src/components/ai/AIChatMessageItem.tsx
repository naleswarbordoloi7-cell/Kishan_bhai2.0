import React, { useState } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Droplets,
  Activity,
  Bug,
  TrendingUp,
  FileCheck,
  Sprout,
} from 'lucide-react';
import { AIChatMessage, FarmingActionCard, DiseaseAnalysisResult } from '../../../shared/types';
import { speakText, stopSpeech, isSpeechSynthesisSupported } from '../../services/webSpeechService';

interface Props {
  message: AIChatMessage;
  onRegenerate?: (content: string) => void;
  onNavigateView?: (view: string) => void;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
  language: string;
}

export const AIChatMessageItem: React.FC<Props> = ({
  message,
  onRegenerate,
  onNavigateView,
  onFeedback,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | undefined>(message.feedback);
  const [showSources, setShowSources] = useState(false);

  const safeContent = typeof message.content === 'string' ? message.content : '';

  const handleCopy = () => {
    if (!safeContent) return;
    navigator.clipboard.writeText(safeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!isSpeechSynthesisSupported() || !safeContent) return;

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const targetLang = message.language || language || 'en';
    setIsSpeaking(true);

    speakText(safeContent, {
      lang: targetLang,
      rate: 0.95,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedbackGiven(type);
    onFeedback?.(message.id, type);
  };

  const isAssistant = message.role === 'assistant';

  // Parser to extract 4 structured advice sections for enhanced UI styling
  const renderFormattedContent = (content: string = '') => {
    const lines = (content || '').split('\n');

    return (
      <div className="space-y-3 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Recommendation Header Banner
          if (trimmed.startsWith('🌱 **Recommendation:') || trimmed.startsWith('🌱 **सिफारिश:') || trimmed.startsWith('🌱 Recommendation:')) {
            const cleanText = trimmed.replace(/^🌱\s*(\*\*Recommendation:|\*\*सिफारिश:|Recommendation:)\s*/i, '').replace(/\*\*$/, '');
            return (
              <div
                key={idx}
                className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/30 p-3 sm:p-4 rounded-xl text-stone-900 dark:text-stone-100 font-medium text-sm sm:text-base mb-3 shadow-xs"
              >
                <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-tight mb-1 flex items-center gap-1.5">
                  <Sprout className="w-3 h-3" />
                  <span>{language === 'hi' ? 'मुख्य सिफारिश' : 'Key Recommendation'}</span>
                </div>
                <div className="text-wrap: balance">{cleanText}</div>
              </div>
            );
          }

          // Section Subheadings: Why? or What to do:
          if (trimmed.startsWith('**Why?') || trimmed.startsWith('**कारण:') || trimmed.startsWith('**What to do:') || trimmed.startsWith('**क्या करें:')) {
            return (
              <div key={idx} className="font-bold text-stone-900 text-xs sm:text-sm pt-2 flex items-center gap-2 border-t border-stone-200/60 mt-2">
                <div className="w-1.5 h-1.5 rounded-sm bg-emerald-600"></div>
                <span className="uppercase tracking-tight text-[10px] sm:text-[11px] text-stone-500">{trimmed.replace(/\*\*/g, '')}</span>
              </div>
            );
          }

          // Warning Box
          if (trimmed.startsWith('⚠️ **Important Warning:') || trimmed.startsWith('⚠️ **महत्वपूर्ण चेतावनी:') || trimmed.startsWith('⚠️ Important Warning:')) {
            const cleanWarning = trimmed.replace(/^⚠️\s*(\*\*Important Warning:|\*\*महत्वपूर्ण चेतावनी:|Important Warning:)\s*/i, '').replace(/\*\*$/, '');
            return (
              <div
                key={idx}
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 sm:p-4 text-stone-900 dark:text-stone-100 text-xs mt-3 flex items-start gap-3 shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-400 text-[10px] uppercase tracking-tight">
                    {language === 'hi' ? 'महत्वपूर्ण चेतावनी' : 'Important Farming Caution'}
                  </div>
                  <div className="text-stone-800 dark:text-stone-300 leading-relaxed">{cleanWarning}</div>
                </div>
              </div>
            );
          }

          // Bullet Points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-800 pl-1">
                <span className="text-emerald-600 font-bold mt-1 text-xs">•</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
              </div>
            );
          }

          // Numbered Steps
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)/);
            if (match) {
              const num = match[1];
              const stepText = match[2];
              return (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800 pl-1 bg-stone-50/80 p-1.5 sm:p-2 rounded-xl border border-stone-200/50">
                  <span className="w-5 h-5 rounded-lg bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {num}
                  </span>
                  <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(stepText) }} />
                </div>
              );
            }
          }

          // Regular paragraph
          if (trimmed.length === 0) return <div key={idx} className="h-1" />;

          return (
            <p
              key={idx}
              className="text-xs sm:text-sm text-stone-800"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
            />
          );
        })}
      </div>
    );
  };

  // Quick inline markdown formatter (bold, code, italics)
  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-stone-950">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-stone-200/80 text-stone-900 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')
      .replace(/\*([^*]+)\*/g, '<em class="italic text-stone-700">$1</em>');
  };

  return (
    <div className={`flex gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'} group`}>
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-emerald-700/30">
          <Bot className="w-4 h-4 text-emerald-200" />
        </div>
      )}

      <div className="min-w-0 max-w-[88%] sm:max-w-[80%] space-y-2.5">
        {/* User / Bot Message Bubble */}
        <div
          className={`rounded-2xl p-3 sm:p-4 text-xs sm:text-sm shadow-xs transition-all break-words [overflow-wrap:anywhere] ${
            isAssistant
              ? 'bg-white/95 backdrop-blur-md border border-stone-200/90 text-stone-900 rounded-tl-xs'
              : 'bg-green-700 text-white rounded-tr-xs border border-white/10'
          }`}
        >
          {/* User Image Attachment */}
          {message.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-white/20 max-w-xs mb-3 shadow-2xs">
              <img
                src={message.imageUrl}
                alt="Crop Upload"
                className="w-full h-auto object-cover max-h-48"
              />
            </div>
          )}

          {/* Render formatted message content */}
          {isAssistant ? (
            renderFormattedContent(safeContent)
          ) : (
            <div className="whitespace-pre-wrap font-medium leading-relaxed break-words">{safeContent}</div>
          )}

          {/* Interactive Action Card (e.g. Irrigation / Disease / Mandi / Schemes) */}
          {message.farmingActionCard && (
            <div className="mt-3 sm:mt-4 bg-stone-50/95 border border-stone-200 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-green-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {message.farmingActionCard.actionType === 'IRRIGATION' && <Droplets className="w-3.5 h-3.5 text-blue-600" />}
                    {message.farmingActionCard.actionType === 'DISEASE_SPRAY' && <Bug className="w-3.5 h-3.5 text-rose-600" />}
                    {message.farmingActionCard.actionType === 'MARKET_SELL' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                    {message.farmingActionCard.actionType === 'GENERAL' && <FileCheck className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm break-words">
                      {message.farmingActionCard.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 break-words">
                      Crop: {message.farmingActionCard.crop} • {message.farmingActionCard.recommendedTime || 'Scheduled'}
                    </p>
                  </div>
                </div>

                {message.farmingActionCard.badge && (
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-tight shrink-0">
                    {message.farmingActionCard.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-700 bg-white p-2 sm:p-2.5 rounded-lg border border-stone-200/60">
                {message.farmingActionCard.reason}
              </p>

              {message.farmingActionCard.actionView && onNavigateView && (
                <button
                  onClick={() => onNavigateView(message.farmingActionCard!.actionView!)}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-[#233f17] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <span>{message.farmingActionCard.actionLabel || 'View in Command Center'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Autonomous App State Modification Notice */}
          {message.executedAction && (
            <div className="mt-3 bg-emerald-50 border border-emerald-300/80 rounded-xl p-3 sm:p-3.5 space-y-2 text-stone-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{message.executedAction.actionTitle}</span>
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-tight">
                  State Updated
                </span>
              </div>
              <p className="text-xs text-stone-700">{message.executedAction.summary}</p>
              {message.executedAction.targetView && onNavigateView && (
                <button
                  onClick={() => onNavigateView(message.executedAction!.targetView!)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:underline cursor-pointer"
                >
                  <span>View in {message.executedAction.targetView.toUpperCase()}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Disease Vision Diagnostic Card */}
          {message.diseaseAnalysis && (
            <div className="mt-3 bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-2 text-stone-900 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
                  <Bug className="w-3.5 h-3.5 text-rose-600" />
                  <span>{message.diseaseAnalysis.possibleDisease}</span>
                </div>
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-tight">
                  Confidence: {message.diseaseAnalysis.confidence}%
                </span>
              </div>
              <p className="text-xs text-stone-700">
                <strong className="text-stone-900">Symptoms:</strong> {message.diseaseAnalysis.symptoms}
              </p>
              <div className="bg-white p-2 rounded-lg border border-rose-200/60 text-xs text-stone-800">
                <strong className="text-emerald-800">Treatment:</strong> {message.diseaseAnalysis.recommendedAction}
              </div>
              <p className="text-[10px] text-stone-500 italic">
                * {message.diseaseAnalysis.disclaimer}
              </p>
            </div>
          )}

          {/* Verified Data Sources Footer */}
          {isAssistant && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-500">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{showSources ? 'Hide Verified Data Sources' : `Verified by ${message.sources.length} Agronomic Sources`}</span>
              </button>

              {showSources && (
                <ul className="mt-1.5 pl-4 list-disc space-y-0.5 text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200/50">
                  {message.sources.map((src, i) => (
                    <li key={i}>{src}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Message Actions Bar (Copy, Audio Read Aloud, Regenerate, Like/Dislike) */}
        {isAssistant && (
          <div className="flex items-center justify-between px-1 text-xs text-stone-500">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-stone-200/70 hover:text-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-medium hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Speak Audio Read Aloud */}
              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  isSpeaking ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-stone-200/70 hover:text-stone-800'
                }`}
                title="Read aloud in Hindi/English"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-700 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-medium hidden sm:inline">{isSpeaking ? 'Speaking...' : 'Listen'}</span>
              </button>

              {/* Regenerate */}
              {onRegenerate && safeContent && (
                <button
                  onClick={() => onRegenerate(safeContent)}
                  className="p-1.5 rounded-lg hover:bg-stone-200/70 hover:text-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Regenerate answer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium hidden sm:inline">Regenerate</span>
                </button>
              )}
            </div>

            {/* Timestamp & Feedback */}
            <div className="flex items-center gap-2 text-[10px]">
              <span>{message.timestamp}</span>
              <div className="flex items-center gap-0.5 border-l border-stone-200 pl-1.5">
                <button
                  onClick={() => handleFeedback('like')}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    feedbackGiven === 'like' ? 'text-emerald-700 bg-emerald-100' : 'hover:bg-stone-200/70 hover:text-stone-800'
                  }`}
                  title="Helpful"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFeedback('dislike')}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    feedbackGiven === 'dislike' ? 'text-rose-700 bg-rose-100' : 'hover:bg-stone-200/70 hover:text-stone-800'
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-stone-300">
          <User className="w-4 h-4 text-stone-700" />
        </div>
      )}
    </div>
  );
};
