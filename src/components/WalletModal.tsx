import React, { useState } from 'react';
import { X, Wallet, Smartphone, Check, Loader, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'select' | 'connecting' | 'success'>('select');

  if (!isOpen) return null;

  const handleConnect = async (walletType: 'xumm' | 'xaman') => {
    setIsConnecting(true);
    setConnectionStep('connecting');
    
    try {
      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await connectWallet();
      setConnectionStep('success');
      
      setTimeout(() => {
        onClose();
        setConnectionStep('select');
        setIsConnecting(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
      setConnectionStep('select');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {connectionStep === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Connect your XRPL wallet to start purchasing tickets and making donations.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-yellow-400 font-medium text-sm">Testnet Mode</h4>
                <p className="text-gray-300 text-xs mt-1">
                  You're connecting to XRPL Testnet. Use testnet XRP for transactions.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleConnect('xumm')}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Xumm Wallet</div>
                  <div className="text-xs text-blue-200">Mobile & Desktop</div>
                </div>
              </button>

              <button
                onClick={() => handleConnect('xaman')}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Xaman (formerly Xumm)</div>
                  <div className="text-xs text-purple-200">Latest version</div>
                </div>
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        )}

        {connectionStep === 'connecting' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connecting Wallet</h3>
              <p className="text-gray-400 text-sm">
                Please approve the connection request in your wallet app.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Connection Steps:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Open your wallet app</li>
                <li>• Review the connection request</li>
                <li>• Approve to connect to XRPL Toolkit</li>
                <li>• Wait for confirmation</li>
              </ul>
            </div>
          </div>
        )}

        {connectionStep === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Wallet Connected!</h3>
              <p className="text-gray-400 text-sm">
                Your wallet is now connected and ready to use.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">You can now:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Purchase event tickets as NFTs</li>
                <li>• Make donations to causes</li>
                <li>• Create and manage events</li>
                <li>• Track your transaction history</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;