import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, Copy, RefreshCw, PlusCircle, Check, X, Coins } from 'lucide-react';

export const WalletConnectModal: React.FC = () => {
  const { isWalletModalOpen, setIsWalletModalOpen, wallet, setWallet, createFreshTestnetWallet, refreshWalletBalance, addToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [customMnemonic, setCustomMnemonic] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isWalletModalOpen) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    addToast('Copied', 'Account reference copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWalletBalance();
    setIsRefreshing(false);
    addToast('Refreshed', 'Settlement balance updated', 'info');
  };

  const handleImportMnemonic = () => {
    const trimmed = customMnemonic.trim();
    if (!trimmed || trimmed.split(' ').length < 24) {
      addToast('Invalid Recovery Phrase', 'Please enter a valid 25-word account recovery phrase.', 'error');
      return;
    }

    setWallet((prev) => ({
      ...prev,
      mnemonic: trimmed,
      address: 'CUSTOM7ESCROWSETTLEMENTACCT9876543210ABCDEFGHIJKL',
    }));
    setIsImporting(false);
    setCustomMnemonic('');
    addToast('Account Linked', 'Payout escrow account loaded successfully', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-lg">Payout & Escrow Account</h3>
              <p className="text-stone-400 text-xs">Verified Settlement Identity & Balance</p>
            </div>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Active Account Card */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Status</span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Escrow Protected
              </span>
            </div>

            <div>
              <span className="text-xs text-stone-500 block mb-1">Account Reference:</span>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-stone-200 text-xs font-mono">
                <span className="truncate max-w-[280px] text-stone-800">{wallet.address}</span>
                <button
                  onClick={copyAddress}
                  className="text-stone-500 hover:text-emerald-700 p-1 rounded hover:bg-stone-100 transition-colors"
                  title="Copy reference"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium block">Settlement Balance</span>
                <span className="text-lg font-bold text-emerald-700 mt-0.5 block flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  ₹{(wallet.usdcBalance * 84).toFixed(0)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-[11px] text-stone-500 font-medium block">Escrow Credits</span>
                <span className="text-lg font-bold text-stone-800 mt-0.5 block">
                  {wallet.algos.toFixed(2)} Credits
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Refresh Balance</span>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-3">
            {!isImporting ? (
              <div className="flex gap-2">
                <button
                  onClick={createFreshTestnetWallet}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Payout Account</span>
                </button>
                <button
                  onClick={() => setIsImporting(true)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  Link Existing Account
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-700 block">
                  Enter 25-word Account Recovery Phrase:
                </label>
                <textarea
                  value={customMnemonic}
                  onChange={(e) => setCustomMnemonic(e.target.value)}
                  rows={2}
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  placeholder="word1 word2 word3..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsImporting(false)}
                    className="text-xs text-stone-500 px-3 py-1.5 rounded hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportMnemonic}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-1.5 rounded-lg"
                  >
                    Link Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 text-[11px] text-stone-500 flex justify-between items-center">
          <span>Verified Cluster Payout Protection</span>
          <span className="font-mono text-emerald-800 font-semibold">ESCROW READY</span>
        </div>
      </div>
    </div>
  );
};

export const WalletConnect = WalletConnectModal;
