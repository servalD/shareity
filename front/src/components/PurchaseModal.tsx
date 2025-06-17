import React, { useState } from 'react';
import { X, CreditCard, Gift, Loader, Check, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { IEventWithCauseId } from '../models/events.model';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEventWithCauseId;
  type: 'ticket' | 'donation';
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, event, type }) => {
  const { sendPayment, mintNFT, balance } = useWallet();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [amount, setAmount] = useState(type === 'ticket' ? event.ticketPrice : 10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [nftId, setNftId] = useState('');

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Simulate payment processing
      const txId = await sendPayment('destination_address', amount);
      setTransactionId(txId);

      // If purchasing a ticket, mint NFT
      if (type === 'ticket') {
        const nftTokenId = await mintNFT({
          event: event.title,
          eventId: event.id.toString(),
          purchaseDate: new Date().toISOString(),
          type: 'event_ticket'
        });
        setNftId(nftTokenId);
      }

      setStep('success');
    } catch (error) {
      console.error('Purchase failed:', error);
      setStep('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep('confirm');
    setAmount(type === 'ticket' ? event.ticketPrice : 10);
    setTransactionId('');
    setNftId('');
  };

  // Calculate charity amount (30% of the total amount)
  const charityAmount = Math.round(amount * 0.3);
  const isInsufficientBalance = amount > balance;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {type === 'ticket' ? (
              <CreditCard className="w-6 h-6 text-blue-400" />
            ) : (
              <Gift className="w-6 h-6 text-green-400" />
            )}
            <h2 className="text-xl font-bold text-white">
              {type === 'ticket' ? 'Purchase Ticket' : 'Make Donation'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">{event.title}</h3>
              <p className="text-gray-400 text-sm">
                {type === 'ticket' 
                  ? 'You will receive an NFT ticket as proof of purchase'
                  : 'Your donation will support the charitable cause'
                }
              </p>
            </div>

            {type === 'donation' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Donation Amount (XRP)
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-3">Payment Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {type === 'ticket' ? 'Ticket Price' : 'Donation Amount'}
                  </span>
                  <span className="text-white font-medium">{amount} XRP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">To {event.cause?.title || 'Charitable Cause'}</span>
                  <span className="text-green-400 font-medium">{charityAmount} XRP</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-white font-bold">{amount} XRP</span>
                  </div>
                </div>
              </div>
            </div>

            {isInsufficientBalance && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-400 font-medium text-sm">Insufficient Balance</h4>
                  <p className="text-gray-300 text-xs mt-1">
                    You need {amount} XRP but only have {balance} XRP available.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium text-sm mb-2">Transaction Details</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Payment will be processed on XRPL Testnet</li>
                {type === 'ticket' && <li>• NFT ticket will be minted to your wallet</li>}
                <li>• Funds will be distributed via multi-escrow</li>
                <li>• Transaction is irreversible once confirmed</li>
              </ul>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isProcessing || isInsufficientBalance}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 ${
                type === 'ticket'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
              } text-white`}
            >
              {type === 'ticket' ? `Purchase for ${amount} XRP` : `Donate ${amount} XRP`}
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Processing Payment</h3>
              <p className="text-gray-400 text-sm">
                Please wait while we process your {type === 'ticket' ? 'ticket purchase' : 'donation'} on the XRPL network.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Processing Steps:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Validating payment details</li>
                <li>• Submitting transaction to XRPL</li>
                {type === 'ticket' && <li>• Minting NFT ticket</li>}
                <li>• Setting up escrow distribution</li>
                <li>• Confirming transaction</li>
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
              <h3 className="text-lg font-semibold text-white mb-2">
                {type === 'ticket' ? 'Ticket Purchased!' : 'Donation Successful!'}
              </h3>
              <p className="text-gray-400 text-sm">
                Your {type === 'ticket' ? 'ticket has been purchased' : 'donation has been processed'} successfully.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-3">Transaction Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Transaction ID</span>
                  <span className="text-white font-mono text-xs">{transactionId}</span>
                </div>
                {type === 'ticket' && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">NFT Token ID</span>
                    <span className="text-white font-mono text-xs">{nftId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount</span>
                  <span className="text-white font-medium">{amount} XRP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">To {event.cause?.title || 'Charitable Cause'}</span>
                  <span className="text-green-400 font-medium">{charityAmount} XRP</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">What's Next?</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {type === 'ticket' ? (
                  <>
                    <li>• Your NFT ticket is now in your wallet</li>
                    <li>• Check your dashboard for event details</li>
                    <li>• You'll receive event updates via email</li>
                  </>
                ) : (
                  <>
                    <li>• Your donation will be distributed to the cause</li>
                    <li>• Track impact in your dashboard</li>
                    <li>• You'll receive donation receipt</li>
                  </>
                )}
                <li>• Funds will be released after the event</li>
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseModal;