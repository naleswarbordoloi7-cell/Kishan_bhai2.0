import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Download,
  Share2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { DigitalCropReportCard } from '../../../shared/types';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DigitalCropReportCard;
  qrDataUrl: string;
  language: string;
  onToggleBuyerApproval: (approved: boolean) => void;
  onDownloadPdf: () => void;
  onCopySuccess: () => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  report,
  qrDataUrl,
  language,
  onToggleBuyerApproval,
  onDownloadPdf,
  onCopySuccess,
}) => {
  const isHi = language === 'hi';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isApproved = report.verification.farmerApprovedForBuyers;
  const shareUrl = report.verification.verificationUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback selection copy
      const input = document.getElementById('kb-report-share-url') as HTMLInputElement | null;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        onCopySuccess();
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Kishan Bhai Crop Report Card — ${report.cropInfo.cropName} (${report.uniqueCropId})`,
          text: `Verified Digital Crop Report Card for ${report.farmerInfo.fullName} · ${report.cropInfo.cropName} (${report.harvestAndQuality.cropQualityGrade}, ${report.harvestAndQuality.harvestQuantityQuintals} Qtl). Verification Code: ${report.verification.verificationCode}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share sheet
      }
    } else {
      handleCopy();
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `*KISHAN BHAI – DIGITAL CROP REPORT CARD*\nCrop: ${report.cropInfo.cropName} (${report.cropInfo.variety})\nCrop ID: ${report.uniqueCropId}\nFarmer: ${report.farmerInfo.fullName} (${report.farmerInfo.village}, ${report.farmerInfo.district})\nOverall Grade: ${report.performance.overallGrade} (${report.performance.overallRatingOutOf5}/5.0)\nQuality: ${report.harvestAndQuality.cropQualityGrade} · Est. Yield: ${report.harvestAndQuality.harvestQuantityQuintals} Quintals\nVerification Code: ${report.verification.verificationCode}\nVerify Online: ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 print:hidden">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#14532D]/20 overflow-hidden">
        <div className="bg-[#14532D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {isHi ? 'रिपोर्ट साझा करें व QR सत्यापन' : 'Share Official Crop Report & QR Verification'}
              </h3>
              <p className="text-xs text-emerald-100/90 font-mono">
                {report.uniqueCropId} · {report.verification.verificationCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Farmer Approval Control */}
          <div
            className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
              isApproved ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
                {isApproved ? (
                  <ShieldCheck className="w-4 h-4 text-[#14532D]" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-700" />
                )}
                <span>
                  {isApproved
                    ? isHi
                      ? 'खरीदारों के लिए किसान-स्वीकृत (सक्रिय)'
                      : 'Farmer Approved for Buyer Inspection'
                    : isHi
                    ? 'निजी ड्राफ्ट (खरीदारों से छिपा हुआ)'
                    : 'Private Record (Hidden from Buyers)'}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isApproved
                  ? isHi
                    ? 'सत्यापित खरीदार आपकी फसल का ग्रेड, उपज और मिट्टी रिपोर्ट देख सकते हैं (फ़ोन नंबर सुरक्षित/गुप्त रहता है)।'
                    : 'Verified buyers can inspect this report card and crop grade via your secure link or Buyer Directory. Personal phone remains private.'
                  : isHi
                  ? 'खरीदारों के साथ साझा करने के लिए स्वीकृति चालू करें।'
                  : 'Enable farmer approval so buyers with this QR link or in the Buyer Directory can inspect crop quality.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleBuyerApproval(!isApproved)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                isApproved
                  ? 'bg-[#14532D] text-white hover:bg-[#0F3F22]'
                  : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
              }`}
            >
              {isApproved ? (isHi ? 'बंद करें' : 'Revoke') : isHi ? 'स्वीकृत करें' : 'Approve'}
            </button>
          </div>

          {/* QR Verification Block */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 border border-stone-200 rounded-lg bg-stone-50/60">
            <div className="w-32 h-32 bg-white p-2 border border-[#14532D]/30 rounded-lg shrink-0 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Verification for ${report.uniqueCropId}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-16 h-16 text-[#14532D]/40" />
              )}
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
                {isHi ? 'डिजिटल सत्यापन QR कोड' : 'Scannable Digital Verification'}
              </div>
              <p className="text-xs text-stone-600">
                {isHi
                  ? 'खरीदार या मंडी अधिकारी इस QR कोड को स्कैन करके फसल की प्रामाणिकता और ग्रेड देख सकते हैं।'
                  : 'Buyers, banks, or FPO procurement desks can scan this QR code to verify crop identity, growth logs, and quality grade.'}
              </p>
              <div className="text-xs font-mono text-stone-700 bg-white border border-stone-200 px-2.5 py-1.5 rounded inline-block">
                Code: <strong>{report.verification.verificationCode}</strong>
              </div>
            </div>
          </div>

          {/* Verification Link Copy */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700">
              {isHi ? 'सुरक्षित सत्यापन लिंक' : 'Secure Verification Link'}
            </label>
            <div className="flex gap-2">
              <input
                id="kb-report-share-url"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono text-stone-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-[#14532D] hover:bg-[#0F3F22] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isHi ? 'कॉपी हुआ' : 'Copied') : isHi ? 'कॉपी' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Share & Export Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#14532D] border border-emerald-200 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{isHi ? 'अन्य ऐप्स' : 'Share Link'}</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#14532D] hover:bg-[#0F3F22] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isHi ? 'PDF डाउनलोड' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
