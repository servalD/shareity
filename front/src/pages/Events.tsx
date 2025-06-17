import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, Search } from 'lucide-react';
import { format } from 'date-fns';
import { EventService } from '../services/events.service';
import { IEventWithCauseId } from '../models/events.model';
import { ServiceErrorCode } from '../services/service.result';
import { useToast } from '../components/ToastContainer';

const Events = () => {
  const { showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [events, setEvents] = useState<IEventWithCauseId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const result = await EventService.getAllEvents();
        
        if (result.errorCode === ServiceErrorCode.success && result.result) {
          console.log('✅ Events loaded:', result.result);
          console.log('🔍 Checking imageUrl for events:');
          result.result.forEach((event, index) => {
            console.log(`Event ${index + 1}:`, {
              id: event.id,
              title: event.title,
              imageUrl: event.imageUrl,
              hasImage: !!event.imageUrl,
              causeAddress: event.cause?.addressDestination
            });
          });
          setEvents(result.result);
        } else {
          const errorMsg = 'Failed to load events';
          setError(errorMsg);
          showError('Loading Error', errorMsg);
        }
      } catch (err) {
        const errorMsg = 'An error occurred while loading events';
        setError(errorMsg);
        showError('Loading Error', errorMsg);
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [showError]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'price':
        return a.ticketPrice - b.ticketPrice;
      case 'popularity':
        return b.attendees - a.attendees;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-white mb-2">Error loading events</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <div></div> {/* Spacer */}
            <h1 className="text-4xl font-bold text-white">Discover Events</h1>
            <Link
              to="/create-event"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Create Event</span>
            </Link>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join events that make a difference. Every ticket purchase supports charitable causes.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date" className="bg-slate-800">Sort by Date</option>
              <option value="price" className="bg-slate-800">Sort by Price</option>
              <option value="popularity" className="bg-slate-800">Sort by Popularity</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {sortedEvents.length} of {events.length} events
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.imageUrl || 'https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Image'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.warn('❌ Failed to load image for event:', event.title, 'URL:', event.imageUrl);
                    e.currentTarget.src = 'https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Image';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully for event:', event.title, 'URL:', event.imageUrl);
                  }}
                />
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  Event
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {event.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                    {format(new Date(event.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-green-400" />
                    {event.city}, {event.country}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Users className="w-4 h-4 mr-2 text-purple-400" />
                    {event.attendees}/{event.maxAttendees} registered
                  </div>
                  {event.cause && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <Heart className="w-4 h-4 mr-2 text-pink-400" />
                      Supporting: {event.cause.title}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Registration Progress</span>
                    <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">{event.ticketPrice}</span>
                    <span className="text-gray-400 ml-1">XRP</span>
                  </div>
                  <Link
                    to={`/events/${event.id}`}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-6">
              {events.length === 0 
                ? "No events have been created yet. Be the first to create an event!"
                : "Try adjusting your filters or search terms to find more events."
              }
            </p>
            <Link
              to="/create-event"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Create New Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;