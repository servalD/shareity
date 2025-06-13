import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, Clock, Star, Share2, Bookmark, ArrowLeft, CreditCard, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import PurchaseModal from '../components/PurchaseModal';

const EventDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isConnected } = useWallet();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'ticket' | 'donation'>('ticket');

  // Mock event data - in production, this would be fetched based on the ID
  const event = {
    id: '1',
    title: 'Tech for Good Conference 2024',
    description: 'Join leading technologists, entrepreneurs, and changemakers as we explore how technology can be leveraged to solve some of the world\'s most pressing challenges. This conference brings together innovators from across the globe to share insights, collaborate on solutions, and inspire action.',
    longDescription: `
      The Tech for Good Conference 2024 is a premier gathering of technology leaders, social entrepreneurs, and impact-driven innovators. Over two days, attendees will participate in keynote presentations, panel discussions, workshops, and networking sessions focused on using technology for positive social and environmental impact.

      Key topics include:
      • AI for Social Good
      • Blockchain for Transparency
      • Sustainable Technology Solutions
      • Digital Inclusion and Accessibility
      • Climate Tech Innovations
      • Healthcare Technology Advances

      This event is designed for technologists, entrepreneurs, investors, NGO leaders, and anyone passionate about creating positive change through technology.
    `,
    date: new Date('2024-03-15'),
    endDate: new Date('2024-03-16'),
    location: 'Mumbai Convention Center, Mumbai, India',
    price: 50,
    capacity: 500,
    registered: 342,
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    category: 'conference',
    cause: {
      name: 'Education',
      percentage: 30,
      description: 'Supporting digital literacy programs in rural communities'
    },
    organizer: {
      name: 'Tech Foundation',
      avatar: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
      verified: true
    },
    featured: true,
    agenda: [
      {
        time: '09:00 AM',
        title: 'Registration & Welcome Coffee',
        speaker: 'Event Team'
      },
      {
        time: '10:00 AM',
        title: 'Opening Keynote: Technology as a Force for Good',
        speaker: 'Dr. Sarah Chen, MIT'
      },
      {
        time: '11:00 AM',
        title: 'Panel: AI Ethics and Social Impact',
        speaker: 'Industry Leaders Panel'
      },
      {
        time: '12:30 PM',
        title: 'Lunch & Networking',
        speaker: 'All Attendees'
      },
      {
        time: '02:00 PM',
        title: 'Workshop: Building Sustainable Tech Solutions',
        speaker: 'Green Tech Alliance'
      },
      {
        time: '04:00 PM',
        title: 'Closing Remarks & Next Steps',
        speaker: 'Conference Organizers'
      }
    ],
    speakers: [
      {
        name: 'Dr. Sarah Chen',
        title: 'AI Research Director, MIT',
        avatar: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg'
      },
      {
        name: 'Raj Patel',
        title: 'Founder, Green Tech Alliance',
        avatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
      },
      {
        name: 'Maria Rodriguez',
        title: 'Social Impact Lead, TechCorp',
        avatar: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg'
      }
    ],
    fundingSplit: {
      venue: 40,
      services: 30,
      charity: 30
    }
  };

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

  const progressPercentage = (event.registered / event.capacity) * 100;

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
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {event.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Featured</span>
                </div>
              )}
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
                  {event.category}
                </span>
                <div className="flex items-center space-x-2 text-gray-300">
                  <img
                    src={event.organizer.avatar}
                    alt={event.organizer.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{event.organizer.name}</span>
                  {event.organizer.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
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
                      <div className="font-medium">{format(event.date, 'EEEE, MMMM dd, yyyy')}</div>
                      <div className="text-sm text-gray-400">
                        {format(event.date, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-5 h-5 mr-3 text-green-400" />
                    <div>
                      <div className="font-medium">{event.location}</div>
                      <div className="text-sm text-gray-400">View on map</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <Users className="w-5 h-5 mr-3 text-purple-400" />
                    <div>
                      <div className="font-medium">{event.registered} / {event.capacity} registered</div>
                      <div className="text-sm text-gray-400">{Math.round(progressPercentage)}% capacity</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Heart className="w-5 h-5 mr-3 text-pink-400" />
                    <div>
                      <div className="font-medium">{event.cause.percentage}% to {event.cause.name}</div>
                      <div className="text-sm text-gray-400">{event.cause.description}</div>
                    </div>
                  </div>
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

              {/* Long Description */}
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-white mb-4">About This Event</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {event.longDescription}
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">Event Agenda</h3>
              <div className="space-y-4">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                    <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-medium min-w-fit">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.speaker}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Speakers */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">Featured Speakers</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="text-center">
                    <img
                      src={speaker.avatar}
                      alt={speaker.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h4 className="font-semibold text-white mb-1">{speaker.name}</h4>
                    <p className="text-gray-400 text-sm">{speaker.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">{event.price} XRP</div>
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
                Secure payment via XRPL • NFT ticket included
              </div>

              {/* Fund Distribution */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Fund Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Venue & Operations</span>
                    <span className="text-white">{event.fundingSplit.venue}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Platform & Services</span>
                    <span className="text-white">{event.fundingSplit.services}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Charitable Cause</span>
                    <span className="text-green-400 font-medium">{event.fundingSplit.charity}%</span>
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
                  <span className="text-white font-medium">{event.registered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-white font-medium">{event.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Funds Raised</span>
                  <span className="text-green-400 font-medium">{event.registered * event.price} XRP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">To Charity</span>
                  <span className="text-green-400 font-medium">
                    {Math.round(event.registered * event.price * (event.cause.percentage / 100))} XRP
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