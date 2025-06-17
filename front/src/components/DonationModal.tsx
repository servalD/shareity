import React, { useState } from 'react';
import { X, Heart, Loader, Check, AlertCircle, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cause: {
    id: string;
    title: string;
    organization: string;
    address?: string;
  };
  onDonationSuccess?: (causeId: string, amount: number) => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, cause, onDonationSuccess }) => {
  const { sendPayment, balance, isConnected } = useWallet();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [amount, setAmount] = useState(10);
  const [address, setAddress] = useState(cause.address || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isInsufficientBalance = amount > balance;
  const isFormValid = amount > 0 && (cause.address || address.trim() !== '');

  const handleDonate = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isFormValid) {
      setError('Please fill all required fields');
      return;
    }

    if (isInsufficientBalance) {
      setError('Insufficient balance for this donation');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      const destinationAddress = cause.address || address;

      const txId = await sendPayment(destinationAddress, amount);
      setTransactionId(txId);
      setStep('success');

      if (onDonationSuccess) {
        onDonationSuccess(cause.id, amount);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process donation');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep('form');
    setAmount(10);
    setAddress(cause.address || '');
    setTransactionId('');
    setError(null);
  };

  const presetAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Make a Donation</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'form' && (
          <div className="space-y-6">
            {/* Cause Info */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-green-400 font-medium mb-1">{cause.title}</h3>
              <p className="text-gray-300 text-sm">by {cause.organization}</p>
            </div>

            {/* Donation Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Donation Amount (XRP)
              </label>

              {/* Preset amounts */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${amount === preset
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0.1"
                step="0.1"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter custom amount"
              />
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Destination Address
              </label>
              {cause.address ? (
                <div className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono">{cause.address}</span>
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">Verified</span>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter XRP address (rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)"
                  />
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ This cause doesn't have a default address. Please enter the destination address.
                  </p>
                </>
              )}
            </div>

            {/* Balance Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Your Balance:</span>
                <span className="text-white font-medium">{balance.toFixed(6)} XRP</span>
              </div>
              {isInsufficientBalance && (
                <p className="text-red-400 text-xs mt-2">
                  Insufficient balance. You need {amount} XRP but only have {balance.toFixed(6)} XRP.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-400 font-medium text-sm">Error</h4>
                  <p className="text-gray-300 text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium text-sm mb-2">Transaction Details</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Payment will be processed on XRPL {balance > 0 ? 'Testnet' : 'Network'}</li>
                <li>• Transaction is irreversible once confirmed</li>
                <li>• You'll receive a transaction receipt</li>
                <li>• Funds will be sent directly to the cause</li>
              </ul>
            </div>

            {/* Connect Wallet Warning */}
            {!isConnected && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-start space-x-3">
                <Wallet className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-orange-400 font-medium text-sm">Wallet Required</h4>
                  <p className="text-gray-300 text-xs mt-1">
                    Please connect your wallet to make a donation.
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleDonate}
              disabled={isProcessing || !isFormValid || isInsufficientBalance || !isConnected}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isConnected
                ? 'Connect Wallet First'
                : isInsufficientBalance
                  ? 'Insufficient Balance'
                  : `Donate ${amount} XRP`
              }
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Processing Donation</h3>
              <p className="text-gray-400 text-sm">
                Please wait while we process your donation on the XRPL network.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Processing Steps:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Validating donation details</li>
                <li>• Submitting transaction to XRPL</li>
                <li>• Waiting for network confirmation</li>
                <li>• Updating donation records</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Donation Successful!</h3>
              <p className="text-gray-400 text-sm">
                Your donation of {amount} XRP has been sent to {cause.title}.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-3">Transaction Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount:</span>
                  <span className="text-white font-medium">{amount} XRP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">To:</span>
                  <span className="text-green-400 font-medium">{cause.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Transaction ID:</span>
                  <span className="text-blue-400 font-mono text-xs break-all">{transactionId}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">What's Next?</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Your donation is now recorded on the blockchain</li>
                <li>• The cause will receive your contribution</li>
                <li>• You can track your donation in your wallet history</li>
                <li>• You may receive updates on how your donation is used</li>
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
