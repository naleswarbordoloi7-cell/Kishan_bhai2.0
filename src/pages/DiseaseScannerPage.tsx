import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scan,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Leaf,
  Sprout,
  Info,
  Clock,
  BookOpen,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  UserCheck,
  Bot,
  Zap,
  Sliders,
  HelpCircle,
  Maximize2,
  FolderDown,
} from 'lucide-react';
import { DiseaseScanResult, DiseaseScanImageQuality } from '../../shared/types';
import { DiseaseScanAnimation } from '../components/disease/DiseaseScanAnimation';
import { ImageQualityCheckCard } from '../components/disease/ImageQualityCheckCard';
import { DiseaseResultCard } from '../components/disease/DiseaseResultCard';
import { DiseaseScanHistory } from '../components/disease/DiseaseScanHistory';

const CROP_OPTIONS = [
  'Auto-detect crop',
  'Wheat',
  'Rice',
  'Maize',
  'Cotton',
  'Tomato',
  'Potato',
  'Mustard',
  'Sugarcane',
  'Pulses',
  'Vegetables',
  'Other',
];

const SCAN_STEPS = [
  'Uploading image...',
  'Checking image quality...',
  'Identifying crop...',
  'Analyzing leaf patterns...',
  'Comparing with disease knowledge...',
  'Generating recommendation...',
];

const DEMO_PRESETS = [
  {
    title: 'Wheat Leaf Rust',
    crop: 'Wheat',
    disease: 'Leaf Rust (Puccinia striiformis)',
    img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    severity: 'MODERATE' as const,
    confidence: 91,
  },
  {
    title: 'Cotton Bacterial Blight',
    crop: 'Cotton',
    disease: 'Bacterial Blight (Xanthomonas)',
    img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    severity: 'MODERATE' as const,
    confidence: 92,
  },
  {
    title: 'Tomato Early Blight',
    crop: 'Tomato',
    disease: 'Early Blight (Alternaria solani)',
    img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    severity: 'HIGH' as const,
    confidence: 95,
  },
  {
    title: 'Potato Late Blight',
    crop: 'Potato',
    disease: 'Late Blight (Phytophthora)',
    img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    severity: 'HIGH' as const,
    confidence: 94,
  },
  {
    title: 'Rice Blast',
    crop: 'Rice',
    disease: 'Rice Blast (Magnaporthe oryzae)',
    img: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
    severity: 'MODERATE' as const,
    confidence: 93,
  },
];

export const DiseaseScannerPage: React.FC = () => {
  const {
    diseaseScans,
    addDiseaseScan,
    addDiaryEntry,
    language,
    setCurrentView,
    addToast,
    askAiWithPrompt,
  } = useApp();

  const [selectedCrop, setSelectedCrop] = useState<string>('Auto-detect crop');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [qualityStatus, setQualityStatus] = useState<DiseaseScanImageQuality | null>(null);
  const [activeResult, setActiveResult] = useState<DiseaseScanResult | null>(
    diseaseScans[0] || null
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Sync active result if list updates
  useEffect(() => {
    if (!activeResult && diseaseScans.length > 0) {
      setActiveResult(diseaseScans[0]);
    }
  }, [diseaseScans, activeResult]);

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      addToast(
        'Unsupported Format',
        'Please upload a JPG, JPEG, PNG, or WEBP photo.',
        'error'
      );
      return;
    }

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > 15) {
      addToast('File Too Large', 'Maximum image size is 15MB.', 'error');
      return;
    }

    const formattedSize =
      sizeInMb >= 1
        ? `${sizeInMb.toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
    setImageFileSize(formattedSize);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setSelectedImage(base64Data);
      setQualityStatus(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    setImageFileSize(null);
    setQualityStatus(null);
  };

  const handleAnalyzeCrop = async () => {
    if (!selectedImage) {
      addToast('No Image Selected', 'Please upload or capture a crop leaf photo first.', 'info');
      return;
    }

    setIsScanning(true);
    setScanProgress(5);
    setCurrentStep(0);

    // Step-by-step progress orchestration (~1.8s)
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < SCAN_STEPS.length) {
          setScanProgress(Math.min(92, Math.round(((next + 1) / SCAN_STEPS.length) * 100)));
          return next;
        }
        return prev;
      });
    }, 280);

    try {
      const response = await fetch('/api/disease/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          crop: selectedCrop,
          language,
          isDemo: isDemoMode,
          userId: 'usr_farmer_ramesh',
        }),
      });

      clearInterval(stepInterval);
      setScanProgress(100);
      setCurrentStep(SCAN_STEPS.length - 1);

      const data = await response.json();

      setTimeout(() => {
        setIsScanning(false);
        if (response.ok && data.scan) {
          setActiveResult(data.scan);
          setQualityStatus(data.quality || null);
          addDiseaseScan(data.scan);
          addToast(
            'Analysis Complete',
            `Identified possible diagnosis: ${data.scan.possibleDisease || data.scan.pathogen}`,
            'success'
          );
        } else {
          setQualityStatus(data.quality || {
            clarity: 'POOR',
            lighting: 'POOR',
            cropVisibility: 'OBSCURED',
            leafVisibility: 'OBSCURED',
            resolution: 'Low',
            passed: false,
            issues: ['Blurry or low contrast photo'],
            suggestions: ['Take a closer photo in better light'],
          });
          addToast('Scan Warning', data.error || 'The image is difficult to analyze.', 'info');
        }
      }, 400);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsScanning(false);
      console.error('Scan error:', err);
      addToast('Scan Failed', 'Could not complete scan. Please try again.', 'error');
    }
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setSelectedImage(preset.img);
    setImageFileSize('1.4 MB');
    setSelectedCrop(preset.crop);
    setIsDemoMode(true);
    setQualityStatus(null);
  };

  const handleAskAi = (result: DiseaseScanResult) => {
    const prompt = `I just scanned my ${result.cropName} crop. The AI identified possible disease: "${result.possibleDisease || result.pathogen}" with ${result.confidenceScore}% confidence. What are the best organic treatments, field management practices, and dosage warnings for my field?`;
    askAiWithPrompt(prompt);
  };

  const handleSaveToDiary = (result: DiseaseScanResult) => {
    addDiaryEntry({
      date: new Date().toISOString().split('T')[0],
      category: 'Disease & Pest',
      crop: result.cropName,
      title: `Pathogen Scan: ${result.possibleDisease || result.pathogen.split('(')[0]}`,
      expenseAmountInr: 350,
      notes: `Identified with ${result.confidenceScore}% confidence. Severity: ${result.severity}. Recommendations: ${result.recommendedAction?.[0] || 'Inspect nearby plants.'}`,
    });
    addToast(
      'Saved to Farm Diary',
      'Disease scan report saved to your seasonal farm diary.',
      'success'
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. PAGE HEADER */}
      <div className="bg-gradient-to-r from-[#1B3B11] via-[#244516] to-[#2D4F1E] text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <Scan className="w-3.5 h-3.5" />
              <span>🔬 AI Crop Disease Scanner</span>
            </span>

            {/* Trust Indicator */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI-powered • Fast analysis • Farmer-friendly</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            {language === 'hi' ? '🔬 एआई फसल रोग स्कैनर' : 'AI Crop Disease Scanner'}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            {language === 'hi'
              ? 'अपनी फसल की तस्वीर अपलोड करें और किसान भाई को संभावित समस्याओं की पहचान करने दें।'
              : 'Upload a photo of your crop and let Kisan Bhai identify possible problems.'}
          </p>
        </div>

        {/* Demo Mode Switch for Hackathon Presentation */}
        <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl backdrop-blur-md self-start md:self-auto min-w-[200px] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Demo Mode</span>
            </div>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isDemoMode ? 'bg-emerald-500' : 'bg-stone-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <span className="text-[11px] text-emerald-200/80">
            {isDemoMode
              ? 'Using calibrated agronomy presets for instant presentation'
              : 'Using live Computer Vision ML pipeline'}
          </span>
        </div>
      </div>

      {/* Main Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Area, Crop Selector & Scan Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* 2. UPLOAD AREA CARD */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#2D4F1E]" />
                <span>
                  {language === 'hi'
                    ? 'प्रभावित फसल की स्पष्ट तस्वीर अपलोड करें'
                    : 'Upload a clear photo of the affected crop'}
                </span>
              </h2>
              {selectedImage && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Ready to scan
                </span>
              )}
            </div>

            {/* Hidden Inputs for File Selection & Camera Capture */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Drag & Drop Card / Image Preview */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!selectedImage) fileInputRef.current?.click();
              }}
              className={`relative aspect-4/3 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group overflow-hidden ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/70 scale-98'
                  : selectedImage
                  ? 'border-stone-200 bg-stone-950'
                  : 'border-stone-300 hover:border-emerald-600 bg-stone-50/80 hover:bg-emerald-50/30'
              }`}
            >
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="Selected leaf target"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                    <span className="text-xs font-medium">Click to replace image</span>
                  </div>

                  {/* Top-Right Badge: File Size & Remove */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {imageFileSize && (
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-medium border border-white/20">
                        {imageFileSize}
                      </span>
                    )}
                    <button
                      onClick={handleRemoveImage}
                      title="Remove image"
                      className="w-7 h-7 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/90 text-[#2D4F1E] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">
                      Drag & Drop photo here, or browse
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Supports JPG, JPEG, PNG, WEBP
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Upload Controls (Take Photo & Upload Image) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl border border-stone-200 shadow-xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>📷 Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl border border-stone-200 shadow-xs transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>📁 Upload Image</span>
              </button>
            </div>

            {/* 3. CROP SELECTION */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700">
                Select Crop Species (or Auto-detect)
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full py-3 px-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Tip Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold">Tip:</strong> For better results, capture the affected leaf in good lighting and keep it in focus.
              </p>
            </div>

            {/* Main Action Button: Analyze Crop */}
            <button
              onClick={handleAnalyzeCrop}
              disabled={isScanning || !selectedImage}
              className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer ${
                !selectedImage
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : isScanning
                  ? 'bg-emerald-900 text-emerald-200 cursor-wait'
                  : 'bg-[#2D4F1E] hover:bg-[#223d16] text-white hover:shadow-lg active:scale-99'
              }`}
            >
              <Scan className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Analyzing Crop...' : 'Analyze Crop'}</span>
            </button>
          </div>

          {/* Hackathon Demo Preset Library */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant Demo Presets</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">1-Click Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-emerald-50/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                >
                  <img
                    src={preset.img}
                    alt={preset.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-800 group-hover:text-emerald-900 truncate">
                      {preset.title}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {preset.disease.split('(')[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Animation / Quality Validation / Disease Result Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* 4. SCAN ANIMATION (During active scanning) */}
          {isScanning ? (
            <DiseaseScanAnimation
              currentStep={currentStep}
              steps={SCAN_STEPS}
              scanProgress={scanProgress}
              imageUrl={selectedImage}
            />
          ) : qualityStatus && !qualityStatus.passed ? (
            /* 5. IMAGE QUALITY WARNING CARD */
            <ImageQualityCheckCard
              quality={qualityStatus}
              onUploadBetterImage={() => fileInputRef.current?.click()}
              language={language}
            />
          ) : activeResult ? (
            /* 6-16. DISEASE RESULT CARD */
            <div className="space-y-4">
              {qualityStatus && qualityStatus.passed && (
                <ImageQualityCheckCard
                  quality={qualityStatus}
                  onUploadBetterImage={() => fileInputRef.current?.click()}
                  language={language}
                />
              )}

              <DiseaseResultCard
                result={activeResult}
                onAskAi={handleAskAi}
                onSaveToDiary={handleSaveToDiary}
                onConsultExpert={() => setCurrentView('talk-to-expert')}
                language={language}
              />
            </div>
          ) : (
            /* Placeholder state before first scan */
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                <Leaf className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-stone-800">
                  Ready to scan your crop
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Upload a photo on the left or choose a demo preset to run the computer vision plant pathology engine.
                </p>
              </div>
            </div>
          )}

          {/* 17. PREVIOUS SCANS HISTORY */}
          <div className="pt-4">
            <DiseaseScanHistory
              scans={diseaseScans}
              onSelectScan={(scan) => {
                setActiveResult(scan);
                if (scan.sampleImageUrl) setSelectedImage(scan.sampleImageUrl);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
