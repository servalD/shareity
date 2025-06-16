import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, TrendingUp, Search, Filter, MapPin, Calendar, Target, Plus } from 'lucide-react';

interface Cause {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  targetAmount: number;
  raisedAmount: number;
  supporters: number;
  image: string;
  organization: string;
  verified: boolean;
  urgency: 'low' | 'medium' | 'high';
  endDate: Date;
  events: number;
}

const Causes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const categories = ['all', 'education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare'];

  const mockCauses: Cause[] = [
    {
      id: '1',
      title: 'Digital Literacy for Rural Communities',
      description: 'Providing computer and internet access to underserved rural areas to bridge the digital divide.',
      category: 'education',
      location: 'Rural Maharashtra, India',
      targetAmount: 50000,
      raisedAmount: 32500,
      supporters: 156,
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
      organization: 'Digital India Foundation',
      verified: true,
      urgency: 'medium',
      endDate: new Date('2024-06-30'),
      events: 8
    },
    {
      id: '2',
      title: 'Clean Water Access Initiative',
      description: 'Installing water purification systems and wells in communities lacking access to clean drinking water.',
      category: 'healthcare',
      location: 'Rajasthan, India',
      targetAmount: 75000,
      raisedAmount: 45600,
      supporters: 234,
      image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg',
      organization: 'Water for All',
      verified: true,
      urgency: 'high',
      endDate: new Date('2024-05-15'),
      events: 12
    },
    {
      id: '3',
      title: 'Reforestation Project',
      description: 'Planting native trees to restore degraded forest areas and combat climate change.',
      category: 'environment',
      location: 'Western Ghats, India',
      targetAmount: 30000,
      raisedAmount: 18750,
      supporters: 89,
      image: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg',
      organization: 'Green Earth Initiative',
      verified: true,
      urgency: 'medium',
      endDate: new Date('2024-08-31'),
      events: 5
    },
    {
      id: '4',
      title: 'Emergency Food Relief',
      description: 'Providing nutritious meals to families affected by natural disasters and economic hardship.',
      category: 'poverty',
      location: 'Multiple States, India',
      targetAmount: 100000,
      raisedAmount: 67800,
      supporters: 445,
      image: 'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg',
      organization: 'Food Security Network',
      verified: true,
      urgency: 'high',
      endDate: new Date('2024-04-30'),
      events: 15
    },
    {
      id: '5',
      title: 'Mental Health Support Program',
      description: 'Providing counseling services and mental health resources to underserved communities.',
      category: 'healthcare',
      location: 'Urban Centers, India',
      targetAmount: 40000,
      raisedAmount: 22100,
      supporters: 167,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
      organization: 'Mind Wellness Foundation',
      verified: true,
      urgency: 'medium',
      endDate: new Date('2024-07-31'),
      events: 6
    },
    {
      id: '6',
      title: 'Street Animal Rescue & Care',
      description: 'Rescuing, treating, and rehabilitating street animals while promoting responsible pet ownership.',
      category: 'animal-welfare',
      location: 'Bangalore, India',
      targetAmount: 25000,
      raisedAmount: 16800,
      supporters: 203,
      image: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg',
      organization: 'Animal Care Society',
      verified: true,
      urgency: 'low',
      endDate: new Date('2024-09-30'),
      events: 4
    }
  ];

  const filteredCauses = mockCauses.filter(cause => {
    const matchesSearch = cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cause.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cause.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedCauses = [...filteredCauses].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return b.supporters - a.supporters;
      case 'urgent':
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      case 'progress':
        return (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount);
      case 'newest':
        return b.endDate.getTime() - a.endDate.getTime();
      default:
        return 0;
    }
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Support Charitable Causes</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover meaningful causes and make a direct impact through event participation and donations.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search causes..."
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
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="trending" className="bg-slate-800">Most Supported</option>
              <option value="urgent" className="bg-slate-800">Most Urgent</option>
              <option value="progress" className="bg-slate-800">Highest Progress</option>
              <option value="newest" className="bg-slate-800">Newest</option>
            </select>
          </div>
        </div>

        {/* Create Cause CTA */}
        <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold text-white mb-2">Have a Cause to Support?</h3>
              <p className="text-gray-300">Create a cause and connect with event organizers who want to make a difference.</p>
            </div>
            <Link
              to="/create-cause"
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-medium flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Cause</span>
            </Link>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {sortedCauses.length} of {mockCauses.length} causes
          </p>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCauses.map((cause) => {
            const progressPercentage = (cause.raisedAmount / cause.targetAmount) * 100;
            
            return (
              <div
                key={cause.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                {/* Cause Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cause.image}
                    alt={cause.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(cause.urgency)}`}>
                    {cause.urgency} priority
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    {cause.category.replace('-', ' ')}
                  </div>
                </div>

                {/* Cause Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">{cause.organization}</span>
                    {cause.verified && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {cause.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {cause.description}
                  </p>

                  {/* Cause Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-green-400" />
                      {cause.location}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      Ends {cause.endDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Target className="w-4 h-4 mr-2 text-purple-400" />
                      {cause.events} supporting events
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {cause.raisedAmount.toLocaleString()} XRP raised
                      </span>
                      <span className="text-white font-medium">
                        {cause.targetAmount.toLocaleString()} XRP goal
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Users className="w-4 h-4 mr-1 text-blue-400" />
                      {cause.supporters} supporters
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                      {cause.events} events
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/causes/${cause.id}`}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-medium text-center block"
                  >
                    Support This Cause
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedCauses.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No causes found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or search terms to find more causes.
            </p>
            <Link
              to="/create-cause"
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-medium"
            >
              Create New Cause
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Causes;