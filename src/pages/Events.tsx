import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, Filter, Search, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  price: number;
  capacity: number;
  registered: number;
  image: string;
  category: string;
  cause: {
    name: string;
    percentage: number;
  };
  organizer: string;
  featured: boolean;
}

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCause, setSelectedCause] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const categories = ['all', 'conference', 'workshop', 'charity', 'sports', 'music', 'education'];
  const causes = ['all', 'education', 'healthcare', 'environment', 'poverty', 'disaster-relief'];

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Tech for Good Conference 2024',
      description: 'Join leading technologists discussing how technology can solve global challenges.',
      date: new Date('2024-03-15'),
      location: 'Mumbai, India',
      price: 50,
      capacity: 500,
      registered: 342,
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
      category: 'conference',
      cause: { name: 'Education', percentage: 30 },
      organizer: 'Tech Foundation',
      featured: true
    },
    {
      id: '2',
      title: 'Blockchain Workshop for Beginners',
      description: 'Learn the fundamentals of blockchain technology and XRPL development.',
      date: new Date('2024-03-20'),
      location: 'Delhi, India',
      price: 25,
      capacity: 100,
      registered: 78,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
      category: 'workshop',
      cause: { name: 'Education', percentage: 25 },
      organizer: 'Crypto Academy',
      featured: false
    },
    {
      id: '3',
      title: 'Charity Marathon for Clean Water',
      description: 'Run for a cause and help provide clean water access to rural communities.',
      date: new Date('2024-03-25'),
      location: 'Bangalore, India',
      price: 15,
      capacity: 1000,
      registered: 567,
      image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg',
      category: 'charity',
      cause: { name: 'Healthcare', percentage: 50 },
      organizer: 'Water Foundation',
      featured: true
    },
    {
      id: '4',
      title: 'Green Energy Summit',
      description: 'Exploring renewable energy solutions for sustainable development.',
      date: new Date('2024-04-02'),
      location: 'Chennai, India',
      price: 40,
      capacity: 300,
      registered: 156,
      image: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg',
      category: 'conference',
      cause: { name: 'Environment', percentage: 40 },
      organizer: 'Green Tech Alliance',
      featured: false
    },
    {
      id: '5',
      title: 'Music for Mental Health',
      description: 'A benefit concert raising awareness and funds for mental health support.',
      date: new Date('2024-04-10'),
      location: 'Pune, India',
      price: 30,
      capacity: 800,
      registered: 623,
      image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      category: 'music',
      cause: { name: 'Healthcare', percentage: 35 },
      organizer: 'Music Therapy Collective',
      featured: true
    },
    {
      id: '6',
      title: 'Youth Leadership Workshop',
      description: 'Empowering young leaders to create positive change in their communities.',
      date: new Date('2024-04-15'),
      location: 'Hyderabad, India',
      price: 20,
      capacity: 150,
      registered: 89,
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
      category: 'education',
      cause: { name: 'Education', percentage: 45 },
      organizer: 'Youth Empowerment Network',
      featured: false
    }
  ];

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesCause = selectedCause === 'all' || event.cause.name.toLowerCase() === selectedCause;
    
    return matchesSearch && matchesCategory && matchesCause;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return a.date.getTime() - b.date.getTime();
      case 'price':
        return a.price - b.price;
      case 'popularity':
        return b.registered - a.registered;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Discover Events</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join events that make a difference. Every ticket purchase supports charitable causes.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-slate-800">
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Cause Filter */}
            <select
              value={selectedCause}
              onChange={(e) => setSelectedCause(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {causes.map(cause => (
                <option key={cause} value={cause} className="bg-slate-800">
                  {cause === 'all' ? 'All Causes' : cause.charAt(0).toUpperCase() + cause.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

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
            Showing {sortedEvents.length} of {mockEvents.length} events
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
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {event.featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Featured</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {event.category}
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
                    {format(event.date, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-green-400" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Users className="w-4 h-4 mr-2 text-purple-400" />
                    {event.registered}/{event.capacity} registered
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Heart className="w-4 h-4 mr-2 text-pink-400" />
                    {event.cause.percentage}% to {event.cause.name}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Registration Progress</span>
                    <span>{Math.round((event.registered / event.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">{event.price}</span>
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
              Try adjusting your filters or search terms to find more events.
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