import React, { useState } from 'react';
import { X, CreditCard, Gift, Loader, Check, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { TicketService } from '../services/tickets.service';
import { EventService } from '../services/events.service';
import { IEventWithCauseId } from '../models/events.model';
import { ServiceErrorCode } from '../services/service.result';
import { useToast } from '../components/ToastContainer';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEventWithCauseId;
  type: 'ticket' | 'donation';
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, event, type }) => {
  const { sendPayment, buyNFT, findFirstTicketWithSellOffer, balance, address } = useWallet();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [amount, setAmount] = useState(type === 'ticket' ? event.ticketPrice : 10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [nftId, setNftId] = useState('');
  const [ticketId, setTicketId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!user?.walletAddress || !address) {
      showError('Wallet Required', 'Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      if (type === 'ticket') {
        showInfo('Checking Availability', 'Verifying ticket availability...');
        const availabilityResult = await TicketService.getEventAvailability(event.id!);

        if (availabilityResult.errorCode !== ServiceErrorCode.success || !availabilityResult.result) {
          throw new Error('Failed to check event availability');
        }

        if (availabilityResult.result.available <= 0) {
          throw new Error('Event is full. No tickets available.');
        }

        if (availabilityResult.result.price !== amount) {
          throw new Error(`Ticket price is ${availabilityResult.result.price} XRP, not ${amount} XRP`);
        }

        showInfo('Creating Ticket', 'Creating ticket record in database...');
        const ticketResult = await TicketService.createTicket(
          event.id!,
          user.walletAddress,
          amount
        );

        if (ticketResult.errorCode !== ServiceErrorCode.success || !ticketResult.result) {
          throw new Error('Failed to create ticket. Event might be full or invalid price.');
        }

        setTicketId(ticketResult.result.id);

        showInfo('Processing Payment', 'Sending payment to charitable cause...');
        const causeAddress = event.cause?.addressDestination || 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'; // Adresse de la cause ou adresse de test par défaut

        if (!event.cause?.addressDestination) {
          console.warn('⚠️ No cause address found, using default test address');
        }

        // const paymentTxId = await sendPayment(causeAddress, amount);
        // setTransactionId(paymentTxId);

        showInfo('Getting Backend Address', 'Retrieving backend payment address...');
        const backendAddressResult = await EventService.getBackendPaymentAddress();
        if (backendAddressResult.errorCode !== ServiceErrorCode.success || !backendAddressResult.result) {
          throw new Error('Failed to get backend payment address');
        }
        const backendAddress = backendAddressResult.result.address;

        showInfo('Finding Available Tickets', 'Searching for available NFT tickets...');
        const eventOffer = await findFirstTicketWithSellOffer(event.id! - 1, backendAddress);

        if (!eventOffer) {
          throw new Error('No tickets available for this event');
        }

        showInfo('Purchasing NFT Ticket', 'Buying NFT ticket from available offers...');
        const purchaseTxId = await buyNFT(eventOffer.nft_offer_index);
        setNftId(eventOffer.NFTokenID);

        showInfo('Finalizing Ticket', 'Updating ticket with purchase information...');
        const updateResult = await TicketService.updateTicketWithNFT(
          ticketResult.result.id,
          eventOffer.NFTokenID,
          purchaseTxId
        );

        if (updateResult.errorCode !== ServiceErrorCode.success) {
          console.warn('⚠️ Failed to update ticket with NFT info, but ticket was created');
        }

        showSuccess('Ticket Purchased!', 'Your NFT ticket has been created successfully!');
      } else {
        showInfo('Processing Donation', 'Sending donation to charitable cause...');
        const causeAddress = event.cause?.addressDestination || 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
        const donationTxId = await sendPayment(causeAddress, amount);
        setTransactionId(donationTxId);
        showSuccess('Donation Successful!', 'Your donation has been sent to the charitable cause!');
      }

      setStep('success');
    } catch (error) {
      showError('Purchase Failed', error instanceof Error ? error.message : 'An unexpected error occurred');
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
                  <span className="text-green-400 font-medium">{amount} XRP</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  100% of your payment goes directly to the charitable cause
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
                {type === 'ticket' && <li>• NFT ticket will be purchased from available offers</li>}
                <li>• Funds will be distributed via multi-escrow</li>
                <li>• Transaction is irreversible once confirmed</li>
              </ul>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isProcessing || isInsufficientBalance}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 ${type === 'ticket'
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
                {type === 'ticket' && <li>• Purchasing NFT ticket</li>}
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
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-300">Transaction ID</span>
                  <span className="text-white font-mono text-xs break-all bg-black/20 p-2 rounded border border-white/10">{transactionId}</span>
                </div>
                {type === 'ticket' && ticketId && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ticket ID</span>
                    <span className="text-white font-mono text-xs">#{ticketId}</span>
                  </div>
                )}
                {type === 'ticket' && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-gray-300">NFT Token ID</span>
                    <span className="text-white font-mono text-xs break-all bg-black/20 p-2 rounded border border-white/10">{nftId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount</span>
                  <span className="text-white font-medium">{amount} XRP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">To {event.cause?.title || 'Charitable Cause'}</span>
                  <span className="text-green-400 font-medium">{amount} XRP</span>
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
