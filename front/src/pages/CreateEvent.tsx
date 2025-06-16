import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Heart, Clock, Image, FileText, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isConnected } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    category: 'conference',
    date: '',
    endDate: '',
    time: '',
    endTime: '',
    location: '',
    capacity: '',
    price: '',
    image: '',
    selectedCause: '',
    charityPercentage: 30,
    venueCosts: 40,
    serviceFees: 30,
    tags: [] as string[],
    requirements: '',
    agenda: [{ time: '', title: '', speaker: '' }]
  });

  const categories = [
    'conference', 'workshop', 'charity', 'sports', 'music', 'education', 'networking', 'cultural'
  ];

  const mockCauses = [
    { id: '1', name: 'Digital Literacy for Rural Communities', category: 'education' },
    { id: '2', name: 'Clean Water Access Initiative', category: 'healthcare' },
    { id: '3', name: 'Reforestation Project', category: 'environment' },
    { id: '4', name: 'Emergency Food Relief', category: 'poverty' },
    { id: '5', name: 'Mental Health Support Program', category: 'healthcare' },
    { id: '6', name: 'Street Animal Rescue & Care', category: 'animal-welfare' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgendaChange = (index: number, field: string, value: string) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setFormData(prev => ({ ...prev, agenda: newAgenda }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { time: '', title: '', speaker: '' }]
    }));
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
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

    // Simulate event creation
    console.log('Creating event:', formData);
    
    // In production, this would submit to the backend
    setTimeout(() => {
      alert('Event created successfully!');
      navigate('/creator-dashboard');
    }, 1000);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Details', icon: Settings },
    { number: 3, title: 'Cause & Funding', icon: Heart },
    { number: 4, title: 'Review', icon: Calendar }
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-slate-800">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Event location"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Description</label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => handleInputChange('longDescription', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide detailed information about your event, agenda, speakers, etc."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
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
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Price per ticket"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Agenda Builder */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">Event Agenda</label>
                  <div className="space-y-4">
                    {formData.agenda.map((item, index) => (
                      <div key={index} className="grid md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                        <input
                          type="time"
                          value={item.time}
                          onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Time"
                        />
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleAgendaChange(index, 'title', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Session title"
                        />
                        <input
                          type="text"
                          value={item.speaker}
                          onChange={(e) => handleAgendaChange(index, 'speaker', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Speaker/Host"
                        />
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          className="px-3 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAgendaItem}
                      className="w-full py-2 border-2 border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors"
                    >
                      + Add Agenda Item
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Cause & Funding */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Cause & Fund Distribution</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Charitable Cause</label>
                  <select
                    required
                    value={formData.selectedCause}
                    onChange={(e) => handleInputChange('selectedCause', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-slate-800">Select a cause to support</option>
                    {mockCauses.map(cause => (
                      <option key={cause.id} value={cause.id} className="bg-slate-800">
                        {cause.name} ({cause.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Fund Distribution</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    Configure how ticket sales will be distributed across different purposes.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Charitable Cause</label>
                        <span className="text-green-400 font-medium">{formData.charityPercentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        value={formData.charityPercentage}
                        onChange={(e) => {
                          const charity = parseInt(e.target.value);
                          const remaining = 100 - charity;
                          const venue = Math.round(remaining * 0.6);
                          const service = remaining - venue;
                          handleInputChange('charityPercentage', charity);
                          handleInputChange('venueCosts', venue);
                          handleInputChange('serviceFees', service);
                        }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Venue & Operations</label>
                        <span className="text-blue-400 font-medium">{formData.venueCosts}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-lg">
                        <div 
                          className="h-2 bg-blue-500 rounded-lg"
                          style={{ width: `${formData.venueCosts}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Platform & Services</label>
                        <span className="text-purple-400 font-medium">{formData.serviceFees}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-lg">
                        <div 
                          className="h-2 bg-purple-500 rounded-lg"
                          style={{ width: `${formData.serviceFees}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2">Distribution Preview</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>For every {formData.price} XRP ticket sold:</div>
                      <div>• {((formData.price * formData.charityPercentage) / 100).toFixed(2)} XRP goes to charity</div>
                      <div>• {((formData.price * formData.venueCosts) / 100).toFixed(2)} XRP for venue costs</div>
                      <div>• {((formData.price * formData.serviceFees) / 100).toFixed(2)} XRP for platform services</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
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
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white ml-2">{formData.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white ml-2">{formData.date} at {formData.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white ml-2">{formData.location}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400">Capacity:</span>
                        <span className="text-white ml-2">{formData.capacity} attendees</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white ml-2">{formData.price} XRP</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Charity:</span>
                        <span className="text-green-400 ml-2">{formData.charityPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Agenda Items:</span>
                        <span className="text-white ml-2">{formData.agenda.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-medium mb-2">Before You Submit</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Ensure all information is accurate and complete</li>
                    <li>• Your event will be reviewed before going live</li>
                    <li>• Escrow contracts will be automatically created</li>
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
              
              {currentStep < 4 ? (
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
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-semibold"
                >
                  Create Event
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