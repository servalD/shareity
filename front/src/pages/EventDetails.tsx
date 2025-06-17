import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, Share2, Bookmark, ArrowLeft, CreditCard, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import PurchaseModal from '../components/PurchaseModal';
import { EventService } from '../services/events.service';
import { IEventWithCauseId } from '../models/events.model';
import { ServiceErrorCode } from '../services/service.result';

const EventDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isConnected } = useWallet();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'ticket' | 'donation'>('ticket');
  const [event, setEvent] = useState<IEventWithCauseId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError('Event ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await EventService.getEventById(parseInt(id));
        
        if (result.errorCode === ServiceErrorCode.success && result.result) {
          console.log('✅ Event loaded:', result.result);
          console.log('🔍 Event imageUrl:', result.result.imageUrl);
          console.log('💰 Cause addressDestination:', result.result.cause?.addressDestination);
          setEvent(result.result);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('An error occurred while loading the event');
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handlePurchase = (type: 'ticket' | 'donation') => {
    if (!isAuthenticated) {
      alert('Please connect your DID first');
      return;
    }
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setPurchaseType(type);
    setIsPurchaseModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/events"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-white mb-2">Event not found</h3>
            <p className="text-gray-400 mb-6">{error || 'The event you are looking for does not exist.'}</p>
            <Link
              to="/events"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = (event.attendees / event.maxAttendees) * 100;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
              <img
                src={event.imageUrl || 'https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Image'}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn('❌ Failed to load image for event:', event.title, 'URL:', event.imageUrl);
                  e.currentTarget.src = 'https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Image';
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully for event:', event.title, 'URL:', event.imageUrl);
                }}
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  Event
                </span>
                {event.cause && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-sm">Supporting: {event.cause.title}</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {event.title}
              </h1>

              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {event.description}
              </p>

              {/* Event Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                      <div className="font-medium">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</div>
                      <div className="text-sm text-gray-400">
                        {format(new Date(event.date), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-5 h-5 mr-3 text-green-400" />
                    <div>
                      <div className="font-medium">{event.city}, {event.country}</div>
                      <div className="text-sm text-gray-400">View on map</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <Users className="w-5 h-5 mr-3 text-purple-400" />
                    <div>
                      <div className="font-medium">{event.attendees} / {event.maxAttendees} registered</div>
                      <div className="text-sm text-gray-400">{Math.round(progressPercentage)}% capacity</div>
                    </div>
                  </div>
                  {event.cause && (
                    <div className="flex items-center text-gray-300">
                      <Heart className="w-5 h-5 mr-3 text-pink-400" />
                      <div>
                        <div className="font-medium">Supporting: {event.cause.title}</div>
                        <div className="text-sm text-gray-400">{event.cause.description}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Registration Progress</span>
                  <span>{Math.round(progressPercentage)}% filled</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">{event.ticketPrice} XRP</div>
                <div className="text-gray-400">per ticket</div>
              </div>

              <div className="space-y-4 mb-6">
                <button
                  onClick={() => handlePurchase('ticket')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Purchase Ticket</span>
                </button>
                <button
                  onClick={() => handlePurchase('donation')}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Gift className="w-5 h-5" />
                  <span>Make Donation</span>
                </button>
              </div>

              <div className="text-center text-sm text-gray-400 mb-4">
                Secure payment via XRPL • NFT ticket included • 100% to cause
              </div>

              {/* Fund Distribution */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Fund Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Charitable Cause</span>
                    <span className="text-green-400 font-medium">100%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    All proceeds directly support the charitable cause
                  </div>
                </div>
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="font-semibold text-white mb-4">Event Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Registered</span>
                  <span className="text-white font-medium">{event.attendees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-white font-medium">{event.maxAttendees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Funds Raised</span>
                  <span className="text-green-400 font-medium">{event.attendees * event.ticketPrice} XRP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">To Charity</span>
                  <span className="text-green-400 font-medium">
                    {event.attendees * event.ticketPrice} XRP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        event={event}
        type={purchaseType}
      />
    </div>
  );
};

export default EventDetails;