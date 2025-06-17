import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, TrendingUp, Search, MapPin, Target, Plus, Image as ImageIcon } from 'lucide-react';
import { ICauseId } from '../models/causes.model';
import { CauseService } from '../services/causes.service';
import { ServiceErrorCode } from '../services/service.result';
import DonationModal from '../components/DonationModal';

interface CauseDisplay {
  id: string;
  title: string;
  description: string;
  location: string;
  addressDestination: string;
  imageUrl: string;
  raisedAmount: number;
  goal: number;
  supporters: number;
  isClosed: boolean;
  events: number;
}

const Causes = () => {
  const [causes, setCauses] = useState<CauseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [donationModal, setDonationModal] = useState<{
    isOpen: boolean;
    cause: CauseDisplay | null;
  }>({ isOpen: false, cause: null });

  const convertCauseToDisplay = (cause: ICauseId): CauseDisplay => {
    return {
      id: cause.id?.toString() || 'unknown',
      title: cause.title || 'Untitled Cause',
      description: cause.description || 'No description available',
      location: cause.location || 'Location not specified',
      addressDestination: cause.addressDestination || '',
      imageUrl: cause.imageUrl || '',
      raisedAmount: parseFloat(cause.raisedAmount) || 0,
      goal: cause.goal || 0,
      supporters: cause.supporters || 0,
      isClosed: cause.isClosed || false,
      events: cause.eventsCount || 0
    };
  };

  useEffect(() => {
    const fetchCauses = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await CauseService.getAllCauses();

        if (result.errorCode === ServiceErrorCode.success && result.result) {
          const convertedCauses = result.result.map(convertCauseToDisplay);
          setCauses(convertedCauses);
        } else {
          setCauses([]);
        }
      } catch (err) {
        setError('Failed to load causes');
        setCauses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCauses();
  }, []);

  const handleDonationSuccess = async (causeId: string, amount: number) => {
    try {
      const currentCause = causes.find(c => c.id === causeId);
      if (!currentCause) {
        return;
      }

      const newRaisedAmount = currentCause.raisedAmount + amount;
      const newSupporters = currentCause.supporters + 1;

      const updateResult = await CauseService.updateCause(parseInt(causeId), {
        raisedAmount: newRaisedAmount.toString(),
        supporters: newSupporters
      });

      if (updateResult.errorCode === ServiceErrorCode.success) {
        setCauses(prevCauses => 
          prevCauses.map(cause => 
            cause.id === causeId 
              ? { ...cause, raisedAmount: newRaisedAmount, supporters: newSupporters }
              : cause
          )
        );
      }
    } catch (error) {
    }
  };

  const filteredCauses = causes.filter(cause => {
    const matchesSearch = cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cause.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const sortedCauses = [...filteredCauses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'trending':
        comparison = a.supporters - b.supporters;
        break;
      case 'urgent':
        comparison = a.raisedAmount - b.raisedAmount;
        break;
      case 'progress':
        comparison = (a.raisedAmount / a.goal) - (b.raisedAmount / b.goal);
        break;
      case 'newest':
        comparison = a.id.localeCompare(b.id);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const getUrgencyColor = (raisedAmount: number, goal: number) => {
    const progress = (raisedAmount / goal) * 100;
    if (progress >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (progress >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const handleOpenDonationModal = (cause: CauseDisplay) => {
    setDonationModal({ isOpen: true, cause });
  };

  const handleCloseDonationModal = () => {
    setDonationModal({ isOpen: false, cause: null });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Support Charitable Causes</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover meaningful causes and make a direct impact through event participation and donations.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex">
              <button
                onClick={() => setSortOrder('desc')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  sortOrder === 'desc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                ↓ Desc
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  sortOrder === 'asc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                ↑ Asc
              </button>
            </div>
          </div>
        </div>

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

        <div className="mb-6">
          <p className="text-gray-400">
            {loading ? 'Loading causes...' : `Showing ${sortedCauses.length} of ${causes.length} causes`}
            {error && <span className="text-red-400 ml-2">({error})</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse"
              >
                <div className="h-48 bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-3"></div>
                  <div className="h-6 bg-gray-700 rounded mb-3"></div>
                  <div className="h-16 bg-gray-700 rounded mb-4"></div>
                  <div className="h-2 bg-gray-700 rounded mb-4"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            sortedCauses.map((cause) => {
              const progressPercentage = (cause.raisedAmount / cause.goal) * 100;

              return (
                <div
                  key={cause.id}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {cause.imageUrl ? (
                      <img
                        src={cause.imageUrl}
                        alt={cause.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">No image available</p>
                        </div>
                      </div>
                    )}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(cause.raisedAmount, cause.goal)}`}>
                      {progressPercentage.toFixed(0)}%
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      #{cause.id}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Cause #{cause.id}</span>
                      {cause.isClosed && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">×</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {cause.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {cause.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-green-400" />
                        {cause.location}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Target className="w-4 h-4 mr-2 text-purple-400" />
                        {cause.events} supporting events
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
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
                          {cause.goal.toLocaleString()} XRP goal
                        </span>
                      </div>
                    </div>

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

                    <button
                      onClick={() => handleOpenDonationModal(cause)}
                      disabled={cause.isClosed}
                      className={`w-full py-3 rounded-lg transition-all duration-200 font-medium text-center ${
                        cause.isClosed 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
                      }`}
                    >
                      {cause.isClosed ? 'Cause Closed' : 'Support This Cause'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && sortedCauses.length === 0 && (
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

      {donationModal.cause && (
        <DonationModal
          isOpen={donationModal.isOpen}
          onClose={handleCloseDonationModal}
          cause={{
            id: donationModal.cause.id,
            title: donationModal.cause.title,
            organization: `Cause #${donationModal.cause.id}`,
            address: donationModal.cause.addressDestination
          }}
          onDonationSuccess={handleDonationSuccess}
        />
      )}
    </div>
  );
};

export default Causes;
