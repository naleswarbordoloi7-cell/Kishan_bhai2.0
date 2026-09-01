// Web Speech API Service for Kisan Bhai
// Supports multi-dialect Indian agricultural voice recognition & speech synthesis

export interface SpeechLanguageOption {
  code: string;
  label: string;
  nativeName: string;
  speechCode: string;
}

export const INDIAN_SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'en', label: 'English (India)', nativeName: 'English (IN)', speechCode: 'en-IN' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
];

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export interface ParsedFarmDiaryVoice {
  category: 'Fertilizer' | 'Disease & Pest' | 'Irrigation' | 'Labour' | 'Harvesting' | 'Sale' | 'Sowing' | 'General';
  crop: string;
  title: string;
  expenseAmountInr?: number;
  revenueAmountInr?: number;
  notes: string;
  rawTranscript: string;
}

/**
 * Intelligent parser that extracts structured agricultural ledger fields
 * from raw natural language voice dictation in English and Hindi.
 */
export function parseFarmVoiceDictation(transcript: string, defaultCrop: string = 'BT Cotton'): ParsedFarmDiaryVoice {
  const lower = transcript.toLowerCase();
  
  // 1. Detect Category
  let category: ParsedFarmDiaryVoice['category'] = 'General';
  if (
    lower.includes('fertilizer') ||
    lower.includes('urea') ||
    lower.includes('dap') ||
    lower.includes('npk') ||
    lower.includes('compost') ||
    lower.includes('manure') ||
    lower.includes('खाद') ||
    lower.includes('उर्वरक') ||
    lower.includes('यूरिया') ||
    lower.includes('गोबर')
  ) {
    category = 'Fertilizer';
  } else if (
    lower.includes('pest') ||
    lower.includes('spray') ||
    lower.includes('fungicide') ||
    lower.includes('insecticide') ||
    lower.includes('disease') ||
    lower.includes('neem') ||
    lower.includes('कीट') ||
    lower.includes('कीटनाशक') ||
    lower.includes('छिड़काव') ||
    lower.includes('बीमारी') ||
    lower.includes('फफूंद')
  ) {
    category = 'Disease & Pest';
  } else if (
    lower.includes('water') ||
    lower.includes('irrigation') ||
    lower.includes('drip') ||
    lower.includes('sprinkler') ||
    lower.includes('borewell') ||
    lower.includes('canal') ||
    lower.includes('पानी') ||
    lower.includes('सिंचाई') ||
    lower.includes('ड्रिप') ||
    lower.includes('मोटर') ||
    lower.includes('पम्प')
  ) {
    category = 'Irrigation';
  } else if (
    lower.includes('labour') ||
    lower.includes('labor') ||
    lower.includes('worker') ||
    lower.includes('wage') ||
    lower.includes('weeding') ||
    lower.includes('मजदूर') ||
    lower.includes('मजदूरी') ||
    lower.includes('निराई') ||
    lower.includes('गुड़ाई')
  ) {
    category = 'Labour';
  } else if (
    lower.includes('harvest') ||
    lower.includes('cutting') ||
    lower.includes('picking') ||
    lower.includes('threshing') ||
    lower.includes('कटाई') ||
    lower.includes('तुड़ाई') ||
    lower.includes('थ्रेशर') ||
    lower.includes('पैदावार')
  ) {
    category = 'Harvesting';
  } else if (
    lower.includes('sold') ||
    lower.includes('sale') ||
    lower.includes('selling') ||
    lower.includes('mandi') ||
    lower.includes('apmc') ||
    lower.includes('revenue') ||
    lower.includes('income') ||
    lower.includes('बेचा') ||
    lower.includes('बिक्री') ||
    lower.includes('मंडी') ||
    lower.includes('कमाई')
  ) {
    category = 'Sale';
  } else if (
    lower.includes('sow') ||
    lower.includes('sowing') ||
    lower.includes('seed') ||
    lower.includes('germination') ||
    lower.includes('बुवाई') ||
    lower.includes('बीज') ||
    lower.includes('बोया')
  ) {
    category = 'Sowing';
  }

  // 2. Detect Crop
  let crop = defaultCrop;
  const commonCrops = [
    { name: 'BT Cotton', keywords: ['cotton', 'कपास', 'रुई'] },
    { name: 'Sharbati Wheat', keywords: ['wheat', 'गेहूं', 'कनक'] },
    { name: 'Groundnut (TG-37A)', keywords: ['groundnut', 'peanut', 'मूंगफली', 'सिंग'] },
    { name: 'Mustard (Pusa Bold)', keywords: ['mustard', 'सरसों', 'राई'] },
    { name: 'Soybean', keywords: ['soybean', 'soya', 'सोयाबीन'] },
    { name: 'Paddy / Basmati Rice', keywords: ['rice', 'paddy', 'धान', 'चावल'] },
    { name: 'Sugarcane', keywords: ['sugarcane', 'गन्ना'] },
    { name: 'Maize (Corn)', keywords: ['maize', 'corn', 'मक्का'] },
    { name: 'Gram / Chickpea', keywords: ['gram', 'chickpea', 'चना'] },
    { name: 'Onion', keywords: ['onion', 'प्याज़', 'कांदा'] },
    { name: 'Potato', keywords: ['potato', 'आलू', 'बटाटा'] },
    { name: 'Tomato', keywords: ['tomato', 'टमाटर'] },
  ];

  for (const c of commonCrops) {
    if (c.keywords.some((kw) => lower.includes(kw))) {
      crop = c.name;
      break;
    }
  }

  // 3. Extract Monetary Amounts (INR)
  let expenseAmountInr: number | undefined = undefined;
  let revenueAmountInr: number | undefined = undefined;

  // Regex looking for numbers near rupee / inr / rs / खर्च / रुपये / बेचे
  const numberMatches = transcript.match(/\b\d+([,.]\d+)?\b/g);
  
  if (numberMatches && numberMatches.length > 0) {
    const rawNumbers = numberMatches.map((n) => parseFloat(n.replace(/,/g, ''))).filter((n) => !isNaN(n) && n > 0);

    // If it's a sale
    if (category === 'Sale' || lower.includes('sold') || lower.includes('बेचा') || lower.includes('बिक्री') || lower.includes('revenue') || lower.includes('income')) {
      const bestNum = rawNumbers.find((n) => n >= 50);
      if (bestNum) {
        revenueAmountInr = bestNum;
      }
    } else {
      // It's likely an expense
      const bestNum = rawNumbers.find((n) => n >= 20);
      if (bestNum) {
        expenseAmountInr = bestNum;
      }
    }
  }

  // 4. Generate Clean Title
  let title = transcript.trim();
  if (title.length > 80) {
    title = `${title.substring(0, 77)}...`;
  }

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    category,
    crop,
    title: title || `${category} operation on ${crop}`,
    expenseAmountInr,
    revenueAmountInr,
    notes: transcript.trim(),
    rawTranscript: transcript,
  };
}

/**
 * Cleanly speak text using Web SpeechSynthesis API with Hindi/English voice pairing
 */
export function speakText(
  text: string,
  options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) return null;

  window.speechSynthesis.cancel();

  // Strip Markdown markers, emojis, and code formatting for speech
  const clean = text
    .replace(/[*_#`[\]()~]/g, ' ')
    .replace(/http\S+/g, '')
    .replace(/[🌱🌾💰🛡️⚠️✅⚡👉🎙️]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  const utterance = new SpeechSynthesisUtterance(clean);
  const langCode = options.lang === 'hi' ? 'hi-IN' : options.lang || 'en-IN';
  utterance.lang = langCode;
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1.0;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
