import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Settings, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { EventService } from '../services/events.service';
import { CauseService } from '../services/causes.service';
import { PinataService } from '../services/pinata.service';
import { IEvent } from '../models/events.model';
import { ICauseId } from '../models/causes.model';
import { ServiceErrorCode } from '../services/service.result';
import { useToast } from '../components/ToastContainer';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isConnected, deployEventWithBackend } = useWallet();
  const { showSuccess, showError, showInfo } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCauses, setIsLoadingCauses] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [causes, setCauses] = useState<ICauseId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    const loadCauses = async () => {
      try {
        setIsLoadingCauses(true);
        const result = await CauseService.getAllCauses();

        if (result.errorCode === ServiceErrorCode.success && result.result) {
          setCauses(result.result);
          console.log('✅ Causes loaded successfully:', result.result);
        } else {
          console.error('❌ Failed to load causes');
          showError('Loading Error', 'Failed to load charitable causes. Please refresh the page.');
        }
      } catch (error) {
        console.error('❌ Error loading causes:', error);
        showError('Loading Error', 'Failed to load charitable causes. Please refresh the page.');
      } finally {
        setIsLoadingCauses(false);
      }
    };

    loadCauses();
  }, [showError]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Invalid File Type', 'Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError('File Too Large', 'Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Invalid File Type', 'Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError('File Too Large', 'Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showError('Authentication Required', 'Please connect your DID first');
      return;
    }

    if (!isConnected) {
      showError('Wallet Connection Required', 'Please connect your wallet first');
      return;
    }

    if (!formData.causeId) {
      showError('Cause Selection Required', 'Please select a charitable cause to support');
      return;
    }

    if (causes.length === 0) {
      showError('No Causes Available', 'No charitable causes are available. Please create some causes first.');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      if (selectedImage) {
        setIsUploading(true);
        try {
          imageUrl = await PinataService.uploadImage(selectedImage);
          console.log('✅ Image uploaded to Pinata:', imageUrl);
          showSuccess('Image Uploaded', 'Event image uploaded successfully to IPFS');
        } catch (error) {
          console.error('❌ Failed to upload image:', error);
          showError('Upload Failed', 'Failed to upload image. Please try again.');
          setIsUploading(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      showInfo('Creating Complete Event Setup', 'Setting up NFT collection via backend, minting tickets, and creating offers...');
      console.log('🎪 Creating complete event setup via backend...');

      // Récupérer le nombre total d'événements pour l'utiliser comme taxon
      let eventsCount = 0;
      try {
        console.log('🔢 Fetching total events count for taxon...');
        const countResult = await EventService.getEventsCount();
        if (countResult.errorCode === ServiceErrorCode.success && countResult.result) {
          eventsCount = countResult.result.count;
          console.log('✅ Current events count:', eventsCount);
        } else {
          console.warn('⚠️ Failed to fetch events count, using default taxon');
          eventsCount = Date.now() % 1000000; // Fallback
        }
      } catch (error) {
        console.error('❌ Error fetching events count:', error);
        eventsCount = Date.now() % 1000000; // Fallback
      }

      // Utiliser le déploiement via backend pour tout configurer
      const eventSetupResult = await deployEventWithBackend({
        name: formData.title,
        description: formData.description,
        eventId: eventsCount,
        maxSupply: parseInt(formData.maxAttendees),
        imageUrl: imageUrl,
        ticketPrice: parseFloat(formData.ticketPrice)
      });

      console.log('✅ Complete event setup finished via backend:', eventSetupResult);
      showSuccess(
        'Blockchain Setup Complete!',
        `Collection, ${eventSetupResult.ticketNFTIds.length} tickets minted, and ${eventSetupResult.offerTxIds.length} offers created successfully! Total cost: ${eventSetupResult.totalCost} XRP`
      );

      showInfo('Creating Event', 'Saving event details to database...');
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
        imageUrl: imageUrl,
        causeId: parseInt(formData.causeId)
      };

      const result = await EventService.createEvent(eventData);

      if (result.errorCode === ServiceErrorCode.success && result.result) {
        console.log('✅ Event created successfully:', result.result);
        showSuccess(
          'Event Created Successfully!',
          'Your event is now live with NFT collection ready for ticket sales.'
        );

        setTimeout(() => {
          navigate('/events');
        }, 2000);
      } else {
        console.error('❌ Failed to create event in database');
        showError(
          'Database Error',
          'Event created on blockchain but failed to save to database. Please contact support.'
        );
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      showError(
        'Creation Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred while creating the event.'
      );
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
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-600 text-gray-400'
                    }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      Step {step.number}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-white' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-600'
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Image</label>
                  {!imagePreview ? (
                    <div
                      className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleImageDrop}
                      onDragOver={handleDragOver}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-2">Drag and drop an image here, or click to select</p>
                      <p className="text-sm text-gray-400">Supports JPG, PNG, GIF (max 5MB)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mt-4">
                    <h4 className="text-purple-400 font-medium mb-2">Image Guidelines</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Recommended size: 1200x800 pixels or larger</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Supported formats: JPG, PNG, GIF</li>
                      <li>• Image will be stored on IPFS via Pinata</li>
                      <li>• High-quality images help attract more attendees</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Charitable Cause</label>
                  <div className="flex space-x-2">
                    <select
                      required
                      value={formData.causeId}
                      onChange={(e) => handleInputChange('causeId', e.target.value)}
                      disabled={isLoadingCauses}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-slate-800">
                        {isLoadingCauses ? 'Loading causes...' : 'Select a cause to support'}
                      </option>
                      {causes.map(cause => (
                        <option key={cause.id} value={cause.id} className="bg-slate-800">
                          {cause.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoadingCauses(true);
                        CauseService.getAllCauses().then(result => {
                          if (result.errorCode === ServiceErrorCode.success && result.result) {
                            setCauses(result.result);
                            showSuccess('Causes Refreshed', 'Charitable causes loaded successfully');
                          } else {
                            showError('Refresh Failed', 'Failed to refresh causes');
                          }
                        }).catch(error => {
                          console.error('Error refreshing causes:', error);
                          showError('Refresh Failed', 'Failed to refresh causes');
                        }).finally(() => {
                          setIsLoadingCauses(false);
                        });
                      }}
                      disabled={isLoadingCauses}
                      className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh causes"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  {isLoadingCauses && (
                    <p className="text-sm text-gray-400 mt-2">Loading charitable causes...</p>
                  )}
                  {!isLoadingCauses && causes.length === 0 && (
                    <p className="text-sm text-yellow-400 mt-2">No charitable causes available. Please create some causes first.</p>
                  )}
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
                          {causes.find(c => c.id.toString() === formData.causeId)?.title || 'Not selected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">NFT Collection Creation</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• An NFT collection will be created for this event</li>
                    <li>• Individual NFT tickets will be minted when purchased</li>
                    <li>• The collection will be linked to your wallet address</li>
                    <li>• Collection metadata will include event details</li>
                    <li>• Maximum supply will be set to {formData.maxAttendees} tickets</li>
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

                {imagePreview && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-purple-400 font-medium mb-2">Image Upload</h4>
                    <div className="flex items-center space-x-4">
                      <img
                        src={imagePreview}
                        alt="Event Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="text-sm text-gray-300">
                        <p>✓ Event image selected</p>
                        <p>✓ Will be uploaded to IPFS during creation</p>
                        <p>✓ Stored permanently on decentralized storage</p>
                      </div>
                    </div>
                  </div>
                )}
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
                  disabled={isSubmitting || isUploading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading Image...</span>
                    </>
                  ) : isSubmitting ? (
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
