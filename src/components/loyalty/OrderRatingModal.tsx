import React, { useState } from 'react';
import { Star, X, Check, Award, AlertCircle, ThumbsUp } from 'lucide-react';
import { BuyerPurchaseRequest, LoyaltyAccount } from '../../../shared/types';
import { loyaltyService } from '../../services/loyaltyService';

interface OrderRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: BuyerPurchaseRequest | null;
  buyerId: string;
  buyerName: string;
  onRatingSuccess: (updatedBuyerAccount: LoyaltyAccount) => void;
}

export const OrderRatingModal: React.FC<OrderRatingModalProps> = ({
  isOpen,
  onClose,
  order,
  buyerId,
  buyerName,
  onRatingSuccess,
}) => {
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [qualityFeedback, setQualityFeedback] = useState<'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'SUBPAR'>('EXCELLENT');
  const [deliveryOnTime, setDeliveryOnTime] = useState<boolean>(true);
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await loyaltyService.rateOrder({
        orderId: order.id,
        farmerId: 'usr_farmer_ramesh', // Linked lot farmer
        buyerId: buyerId || order.buyerId,
        buyerName: buyerName || order.buyerName,
        ratingScore,
        qualityFeedback,
        deliveryOnTime,
        comments,
      });

      onRatingSuccess(res.buyerAccount);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-emerald-900/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white p-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="font-bold font-serif-display text-lg text-white">
                Rate Completed Trade
              </h3>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              {order.crop} • {(order.quantityKg / 1000).toFixed(1)} Tons
            </p>
          </div>

          <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loyalty Reward Callout */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-5 py-2.5 flex items-center justify-between text-xs">
          <span className="text-amber-900 font-medium flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-700" />
            <span>Submit genuine review:</span>
          </span>
          <span className="font-mono font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
            +20 Buyer Loyalty Points
          </span>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Star Rating Selector */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Overall Satisfaction Score:</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingScore(star)}
                  className="p-1 text-stone-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingScore
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-200'
                    }`}
                  />
                </button>
              ))}
              <span className="font-mono font-bold text-sm text-stone-700 ml-2">
                {ratingScore} of 5 Stars
              </span>
            </div>
          </div>

          {/* Quality Grade Radio Chips */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Crop Quality Assessment:</label>
            <div className="grid grid-cols-2 gap-2">
              {(['EXCELLENT', 'GOOD', 'AVERAGE', 'SUBPAR'] as const).map((grade) => (
                <button
                  type="button"
                  key={grade}
                  onClick={() => setQualityFeedback(grade)}
                  className={`p-2 rounded-xl text-left font-medium border transition-colors cursor-pointer ${
                    qualityFeedback === grade
                      ? 'bg-emerald-50 border-emerald-700 text-emerald-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery On Time Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <span className="font-semibold text-stone-800 block">Delivered on Schedule?</span>
              <span className="text-[11px] text-stone-500">Arrived within agreed mandi dispatch window</span>
            </div>
            <button
              type="button"
              onClick={() => setDeliveryOnTime(!deliveryOnTime)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                deliveryOnTime
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-300 text-stone-700'
              }`}
            >
              {deliveryOnTime ? 'Yes, On Time' : 'Delayed'}
            </button>
          </div>

          {/* Feedback comments */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Public Grower Feedback:
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Excellent packing, moisture within specs, transparent cluster weight."
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit & Claim +20 Pts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
