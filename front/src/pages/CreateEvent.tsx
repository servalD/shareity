import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Heart, Clock, Image, FileText, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { EventService } from '../services/events.service';
import { IEvent } from '../models/events.model';
import { ServiceErrorCode } from '../services/service.result';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isConnected, createNFTCollection } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    city: '',
    country: '',
    maxAttendees: '',
    ticketPrice: '',
    imageUrl: '',
    causeId: ''
  });

  const categories = [
    'conference', 'workshop', 'charity', 'sports', 'music', 'education', 'networking', 'cultural'
  ];

  // Mock causes - in production, this would be fetched from the backend
  const mockCauses = [
    { id: 1, title: 'Digital Literacy for Rural Communities', description: 'Supporting digital literacy programs in rural communities' },
    { id: 2, title: 'Clean Water Access Initiative', description: 'Providing clean water access to communities in need' },
    { id: 3, title: 'Reforestation Project', description: 'Planting trees to combat climate change' },
    { id: 4, title: 'Emergency Food Relief', description: 'Providing emergency food assistance to families' },
    { id: 5, title: 'Mental Health Support Program', description: 'Supporting mental health initiatives' },
    { id: 6, title: 'Street Animal Rescue & Care', description: 'Rescuing and caring for street animals' }
  ];

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

    setIsSubmitting(true);

    try {
      // Step 1: Create NFT Collection
      console.log('🎨 Creating NFT collection for event...');
      const collectionMetadata = {
        name: `${formData.title} - Event Collection`,
        description: `NFT collection for ${formData.title}. Each NFT represents a ticket to this event.`,
        eventId: Date.now(), // Temporary ID until we get the real one from the database
        maxSupply: parseInt(formData.maxAttendees),
        imageUrl: formData.imageUrl
      };

      const collectionTxId = await createNFTCollection(collectionMetadata);
      console.log('✅ NFT collection created with transaction ID:', collectionTxId);

      // Step 2: Create event in database
      console.log('💾 Creating event in database...');
      const eventData: IEvent = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        city: formData.city,
        country: formData.country,
        maxAttendees: parseInt(formData.maxAttendees),
        attendees: 0,
        ticketPrice: parseFloat(formData.ticketPrice),
        imageUrl: formData.imageUrl,
        causeId: parseInt(formData.causeId)
      };

      const result = await EventService.createEvent(eventData);
      
      if (result.errorCode === ServiceErrorCode.success && result.result) {
        console.log('✅ Event created successfully:', result.result);
        alert('Event created successfully! NFT collection has been created and event is now live.');
        navigate('/events');
      } else {
        console.error('❌ Failed to create event in database');
        alert('Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('An error occurred while creating the event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Details', icon: Settings },
    { number: 3, title: 'Review', icon: Calendar }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create New Event</h1>
          <p className="text-xl text-gray-400">
            Create an impactful event that supports charitable causes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-600 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      Step {step.number}
                    </div>
                    <div className={`text-xs ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your event"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Event city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Event country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Attendees</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.maxAttendees}
                      onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Maximum attendees"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Price (XRP)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange('ticketPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Price per ticket"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Charitable Cause</label>
                  <select
                    required
                    value={formData.causeId}
                    onChange={(e) => handleInputChange('causeId', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-slate-800">Select a cause to support</option>
                    {mockCauses.map(cause => (
                      <option key={cause.id} value={cause.id} className="bg-slate-800">
                        {cause.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Review & Submit</h2>
                
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Event Summary</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Title:</span>
                        <span className="text-white ml-2">{formData.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white ml-2">{formData.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white ml-2">{formData.city}, {formData.country}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Capacity:</span>
                        <span className="text-white ml-2">{formData.maxAttendees} attendees</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white ml-2">{formData.ticketPrice} XRP</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Cause:</span>
                        <span className="text-green-400 ml-2">
                          {mockCauses.find(c => c.id.toString() === formData.causeId)?.title || 'Not selected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">NFT Collection Creation</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• An NFT collection will be created for this event</li>
                    <li>• Each ticket purchase will mint an NFT from this collection</li>
                    <li>• The collection will be linked to your wallet address</li>
                    <li>• Collection metadata will include event details</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-medium mb-2">Before You Submit</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Ensure all information is accurate and complete</li>
                    <li>• NFT collection creation requires wallet signature</li>
                    <li>• Event will be created only after successful NFT collection creation</li>
                    <li>• You can edit details until the first ticket is sold</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <span>Create Event</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;