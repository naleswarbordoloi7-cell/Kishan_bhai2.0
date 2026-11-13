import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Truck,
  Users,
  Scale,
  X,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { HarvestPoolLot } from '../../../shared/types';

interface VirtualClusterAggregatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableLots: HarvestPoolLot[];
  onCommitCluster?: (farmerIds: string[]) => void;
}

export const VirtualClusterAggregatorModal: React.FC<VirtualClusterAggregatorModalProps> = ({
  isOpen,
  onClose,
  availableLots,
}) => {
  const [buyerRequest, setBuyerRequest] = useState<string>('Needs 100 quintals of Grade A Wheat in Punjab');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    cluster_formed: boolean;
    selected_farmer_ids: string[];
    total_aggregated_volume: number;
    shortfall_volume: number;
    smart_contract_ready: boolean;
    matched_lots?: HarvestPoolLot[];
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPresets = [
    { label: 'Punjab Wheat (100 qtl)', query: 'Needs 100 quintals of Grade A Wheat in Punjab', radius: 50 },
    { label: 'Gujarat Cotton (150 qtl)', query: 'Needs 150 quintals of A+ Export Cotton in Gujarat', radius: 60 },
    { label: 'Malwa Soybean (100 qtl)', query: 'Needs 100 quintals of Organic Soybean in Malwa', radius: 45 },
    { label: 'Rajasthan Mustard (80 qtl)', query: 'Needs 80 quintals of Grade A Yellow Mustard in Sikar', radius: 50 },
  ];

  const handleAggregate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/supply-chain/aggregate-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerRequest,
          maxRadiusKm,
          availableLocalSupply: availableLots,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('[VirtualClusterAggregator] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const jsonOutput = result ? JSON.stringify({
    cluster_formed: result.cluster_formed,
    selected_farmer_ids: result.selected_farmer_ids,
    total_aggregated_volume: result.total_aggregated_volume,
    shortfall_volume: result.shortfall_volume,
    smart_contract_ready: result.smart_contract_ready,
  }, null, 2) : '';

  const handleCopy = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Kishan Bhai Supply Chain Aggregator</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
                  AI Virtual Cluster
                </span>
              </h3>
              <p className="text-xs text-stone-300">
                Match commercial buyer demand with fractional supply from smallholder farmers within transport radius.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-stone-900 dark:text-stone-100">
          {/* Quick presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Quick Buyer Request Presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setBuyerRequest(preset.query);
                    setMaxRadiusKm(preset.radius);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    buyerRequest === preset.query
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 font-bold'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Buyer Commercial Demand Request:
              </label>
              <textarea
                value={buyerRequest}
                onChange={(e) => setBuyerRequest(e.target.value)}
                placeholder="e.g. Needs 100 quintals of Grade A Wheat in Punjab"
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span>Max Radius Limit:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{maxRadiusKm} km</span>
              </label>
              <input
                type="range"
                min="15"
                max="150"
                step="5"
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>15 km (Local)</span>
                <span>150 km (Regional)</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={isLoading || !buyerRequest.trim()}
            onClick={handleAggregate}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-800 to-amber-700 hover:from-emerald-900 hover:to-amber-800 text-white shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Aggregating Fractional Farmer Lots with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Build Virtual Cluster & Verify Smart Contract</span>
              </>
            )}
          </button>

          {/* Result Section */}
          {result && (
            <div className="space-y-4 pt-2">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-[11px] font-bold text-stone-400 uppercase">Cluster Formed</div>
                  <div className="text-base font-bold flex items-center gap-1.5 mt-1">
                    {result.cluster_formed ? (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Formed
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Incomplete
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-[11px] font-bold text-stone-400 uppercase">Aggregated Volume</div>
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1 flex items-center gap-1">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>{result.total_aggregated_volume} qtl</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-[11px] font-bold text-stone-400 uppercase">Shortfall Volume</div>
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {result.shortfall_volume === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400">0 qtl (Full)</span>
                    ) : (
                      <span className="text-rose-600">{result.shortfall_volume} qtl</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-[11px] font-bold text-stone-400 uppercase">Smart Contract</div>
                  <div className="text-base font-bold mt-1">
                    {result.smart_contract_ready ? (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <span className="text-stone-400">Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Matched Farmer Lots breakdown */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Selected Smallholder Farmers ({result.selected_farmer_ids.length})</span>
                  </span>
                  <span className="text-stone-500 font-normal">Within {maxRadiusKm} km Radius</span>
                </div>

                <div className="divide-y divide-emerald-100 dark:divide-emerald-900/40 text-xs">
                  {result.selected_farmer_ids.map((id, index) => {
                    const lot = availableLots.find((l) => l.farmerId === id || l.id === id);
                    return (
                      <div key={id} className="py-2 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <span>#{index + 1} {lot?.farmerName || `Farmer ${id}`}</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                              {id}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2">
                            <span>{lot?.village || 'Regional Cluster'}</span>
                            <span>•</span>
                            <span>{lot?.variety || lot?.crop || 'Produce Lot'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">{lot?.qualityGrade || 'Grade A'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-800 dark:text-emerald-300">
                            {lot?.quantityKg ? (lot.quantityKg / 100) : 35} Quintals
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {(lot?.quantityKg || 3500).toLocaleString()} kg
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strict JSON Output Accordion / Card */}
              <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 space-y-2 border border-stone-800 font-mono text-xs">
                <div className="flex items-center justify-between text-stone-400 pb-1 border-b border-stone-800">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <FileCode className="w-4 h-4" />
                    <span>Strict JSON Output (Supply Chain Aggregator Spec)</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-white px-2 py-1 bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="text-emerald-400 text-xs overflow-x-auto py-2">
                  {jsonOutput}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-900/60">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>Fractional lots pooled into 1 delivery hub</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
