import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Target, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { ICause } from '../models/causes.model';
import { CauseService } from '../services/causes.service';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

const CreateCause = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isConnected, mintNFT } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    goal: '',
    supporters: 0,
    isClosed: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please connect your DID first');
      return;
    }

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      // Convertir les données au format ICause
      const causeData: ICause = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        goal: Number(formData.goal),
        supporters: formData.supporters,
        isClosed: formData.isClosed
      };

      console.log('Creating cause:', causeData);

      // Créer la cause via le service backend
      const result = await CauseService.createCause(causeData);

      if (result.errorCode !== 0) { // 0 corresponds to ServiceErrorCode.success
        throw new Error('Failed to create cause');
      }

      const createdCause = result.result;
      if (!createdCause) {
        throw new Error('No cause data returned from server');
      }

      console.log('✅ Cause created successfully:', createdCause);

      // Créer un NFT pour la cause
      const nftMetadata = {
        type: 'cause_certificate',
        causeId: createdCause.id,
        title: createdCause.title,
        description: createdCause.description,
        location: createdCause.location,
        goal: createdCause.goal,
        createdAt: new Date().toISOString(),
        creator: 'cause_owner'
      };

      console.log('🎨 Minting NFT for cause:', nftMetadata);
      const nftTxId = await mintNFT(nftMetadata);
      console.log('✅ NFT minted successfully, transaction ID:', nftTxId);

      alert(`Cause created successfully! 
      🎉 Cause ID: ${createdCause.id}
      🎨 NFT Transaction: ${nftTxId}
      Your cause will be reviewed before going live.`);

      navigate('/causes');
    } catch (error) {
      console.error('❌ Error creating cause:', error);

      // Afficher une erreur plus détaillée
      let errorMessage = 'Failed to create cause. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create New Cause</h1>
          <p className="text-xl text-gray-400">
            Share your cause and connect with event organizers who want to make a difference
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Heart className="w-6 h-6 text-pink-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Cause Information</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cause Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter a compelling title for your cause"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Describe your cause and how it will make a difference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Where is this cause focused? (e.g., Mumbai, India or Global)"
                  />
                </div>
              </div>
            </div>

            {/* Funding Goal */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Target className="w-6 h-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Funding Goal</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Goal Amount (XRP)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="How much do you need to raise?"
                  />
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Funding Information</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Funds will be distributed automatically via XRPL escrows</li>
                    <li>• Event organizers can choose what percentage to allocate to your cause</li>
                    <li>• All transactions are transparent and trackable on the blockchain</li>
                    <li>• You'll receive real-time updates on funding progress</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status Configuration */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Status & Settings</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Initial Supporters Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.supporters}
                    onChange={(e) => handleInputChange('supporters', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of current supporters (default: 0)"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cause Status</label>
                    <p className="text-xs text-gray-400">
                      {formData.isClosed ? 'This cause is closed for new donations' : 'This cause is open for donations'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isClosed', !formData.isClosed)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${formData.isClosed
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}
                  >
                    {formData.isClosed ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        <span>Closed</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        <span>Open</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <h4 className="text-yellow-400 font-medium mb-2">Before You Submit</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Your cause will be reviewed by our team before going live</li>
                  <li>• Ensure all information is accurate and complete</li>
                  <li>• You'll be notified once your cause is approved</li>
                  <li>• Event organizers will be able to select your cause for their events</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-lg transition-all duration-200 font-semibold text-lg ${isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
                  } text-white`}
              >
                {isLoading ? 'Creating Cause & NFT...' : 'Submit Cause for Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCause;
