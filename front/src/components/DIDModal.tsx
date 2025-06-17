import React, { useState, useEffect } from 'react';
import { X, Shield, Check, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFractalKYC, useFractalDID, useFractalVerify } from '../contexts/DIDContext';
// TODO: DEBUG
interface DIDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIDModal: React.FC<DIDModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const { redirectUrl, status: kycStatus, error: kycError, startKYC } = useFractalKYC();
  const { fetchDID, setDID, didUri, isSetting: isSettingDid, error: didError } = useFractalDID();
  const { verify, isVerifying, valid: verifyValid, error: verifyError } = useFractalVerify();

  const [step, setStep] = useState<'kyc' | 'setDid' | 'verify' | 'complete'>('kyc');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (kycStatus === 'approved') {
      setStep('setDid');
    } else if (kycStatus === 'rejected') {
      setStep('kyc');
      alert('KYC was rejected, please retry.');
    }
  }, [kycStatus]);

  useEffect(() => {
    if (verifyValid === true) {
      setStep('complete');
    } else if (verifyValid === false) {
      alert('Verification failed, please try again.');
      setStep('setDid');
    }
  }, [verifyValid]);

  if (!isOpen) return null;

  const handleStartKYC = async () => {
    setIsLoading(true);
    try {
      const url = await startKYC();
      window.open(url, '_blank');
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDID = async () => {
    setIsLoading(true);
    try {
      const vcUri = await fetchDID();
      await setDID(vcUri);
      setStep('verify');
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      if (didUri) {
        await verify(didUri);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    if (didUri) {
      login(didUri);
    }
    onClose();
    setStep('kyc');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">XRPL DID Setup</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps */}
        {step === 'kyc' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Complete KYC Verification</h3>
              <p className="text-gray-400 text-sm">
                Click below to start the Fractal KYC process. A new tab will open for verification.
              </p>
            </div>
            <button
              onClick={handleStartKYC}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Start KYC</span>}
            </button>
            {kycError && <p className="text-red-500 text-sm">{kycError.message}</p>}
          </div>
        )}

        {step === 'setDid' && (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Issue Decentralized Identifier</h3>
              <p className="text-gray-400 text-sm">
                We will now register your DID on the XRPL network. Please approve the transaction in your Xumm/Xaman wallet.
              </p>
            </div>
            <button
              onClick={handleSetDID}
              disabled={isLoading || isSettingDid}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {(isLoading || isSettingDid) ? <Loader className="w-4 h-4 animate-spin" /> : <span>Set DID</span>}
            </button>
            {didError && <p className="text-red-500 text-sm">{didError.message}</p>}
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Verify Your DID</h3>
              <p className="text-gray-400 text-sm">
                Final step: verify your DID credential. Approve the request in your wallet.
              </p>
            </div>
            <button
              onClick={handleVerify}
              disabled={isLoading || isVerifying}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {(isLoading || isVerifying) ? <Loader className="w-4 h-4 animate-spin" /> : <span>Verify DID</span>}
            </button>
            {verifyError && <p className="text-red-500 text-sm">{verifyError.message}</p>}
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">All Set!</h3>
              <p className="text-gray-400 text-sm">
                Your decentralized identity is active and verified on the XRPL network.
              </p>
            </div>
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DIDModal;
