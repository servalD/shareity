import { useState, useEffect } from 'react';
import { Calendar, Heart, Ticket, TrendingUp, Star, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { DashboardService, DashboardStats, RecentActivity } from '../services/dashboard.service';
import { ServiceErrorCode } from '../services/service.result';
import { useToast } from '../components/ToastContainer';

const Dashboard = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<DashboardStats>({
    eventsAttended: 0,
    totalDonated: 0,
    causesSupported: 0,
    nftTickets: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [nftTickets, setNftTickets] = useState<any[]>([]);

  // Load user data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Load user stats
        const statsResult = await DashboardService.getUserStats(user.walletAddress);
        if (statsResult.errorCode === ServiceErrorCode.success && statsResult.result) {
          setUserStats(statsResult.result);
        }

        // Load recent activity
        const activityResult = await DashboardService.getUserActivity(user.walletAddress);
        if (activityResult.errorCode === ServiceErrorCode.success && activityResult.result) {
          setRecentActivity(activityResult.result);
        }

        // Load NFT tickets
        const ticketsResult = await DashboardService.getUserTickets(user.walletAddress);
        if (ticketsResult.errorCode === ServiceErrorCode.success && ticketsResult.result) {
          setNftTickets(ticketsResult.result || []);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Error', 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.walletAddress, showError]);

  // Filter activities for different sections
  const recentEvents = recentActivity.filter(activity => activity.type === 'ticket');
  const donations = recentActivity.filter(activity => activity.type === 'donation');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'nfts', label: 'NFT Tickets', icon: Ticket }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">My Dashboard</h1>
          <p className="text-xl text-gray-400">
            Track your event participation, donations, and impact
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-white">Loading your dashboard...</span>
            </div>
          </div>
        )}

        {/* Not Connected State */}
        {!user?.walletAddress && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-yellow-400 font-medium mb-2">Wallet Required</h3>
              <p className="text-gray-300 text-sm">
                Please connect your wallet to view your dashboard data.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {user?.walletAddress && !isLoading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Events Attended</p>
                    <p className="text-3xl font-bold text-white">{userStats.eventsAttended}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Total Donated</p>
                    <p className="text-3xl font-bold text-white">{(userStats.totalDonated.toFixed(6))} XRP</p>
                  </div>
                  <Heart className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Causes Supported</p>
                    <p className="text-3xl font-bold text-white">{userStats.causesSupported}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">NFT Tickets</p>
                    <p className="text-3xl font-bold text-white">{userStats.nftTickets}</p>
                  </div>
                  <Ticket className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-8">
              <div className="flex space-x-1 p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Account Overview</h2>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <div>
                              <h4 className="font-medium text-white">{event.title}</h4>
                              <p className="text-sm text-gray-400">{format(event.date, 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white">{event.ticketPrice || event.amount} XRP</p>
                            <p className="text-xs text-green-400">{event.charityAmount || 0} XRP to charity</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Your Impact</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                        <h4 className="text-green-400 font-medium mb-2">Total Charitable Impact</h4>
                        <p className="text-2xl font-bold text-white mb-2">{userStats.totalDonated} XRP</p>
                        <p className="text-sm text-gray-300">
                          Across {userStats.causesSupported} different causes
                        </p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                        <h4 className="text-blue-400 font-medium mb-2">Event Participation</h4>
                        <p className="text-2xl font-bold text-white mb-2">{userStats.eventsAttended}</p>
                        <p className="text-sm text-gray-300">
                          Events attended with {userStats.nftTickets} NFT tickets collected
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">My Events</h2>

                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.status === 'attended'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-blue-600/20 text-blue-400'
                            }`}>
                            {event.status === 'attended' ? 'Attended' : 'Upcoming'}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-gray-300">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            {format(event.date, 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Ticket className="w-4 h-4 mr-2 text-purple-400" />
                            Ticket: {event.ticketPrice || event.amount} XRP
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Heart className="w-4 h-4 mr-2 text-green-400" />
                            Donated: {event.charityAmount || 0} XRP
                          </div>
                        </div>

                        {event.nftId && (
                          <div className="mt-4 p-3 bg-white/5 rounded">
                            <div className="flex flex-col space-y-1">
                              <span className="text-xs text-gray-400">NFT Ticket ID:</span>
                              <span className="text-xs text-gray-300 font-mono break-all bg-black/20 p-2 rounded border border-white/10">{event.nftId}</span>
                            </div>
                          </div>
                        )}

                        {event.txId && (
                          <div className="mt-2 p-3 bg-white/5 rounded">
                            <div className="flex flex-col space-y-1">
                              <span className="text-xs text-gray-400">Transaction ID:</span>
                              <span className="text-xs text-gray-300 font-mono break-all bg-black/20 p-2 rounded border border-white/10">{event.txId}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Donations Tab */}
              {activeTab === 'donations' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">My Donations</h2>

                  {donations.length > 0 ? (
                    <div className="space-y-4">
                      {donations.map((donation) => (
                        <div key={donation.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{donation.cause || donation.title}</h3>
                            <span className="text-2xl font-bold text-green-400">{donation.amount} XRP</span>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <span>{format(donation.date, 'MMM dd, yyyy')}</span>
                            </div>
                            {donation.txId && (
                              <div className="flex flex-col space-y-1">
                                <span className="text-xs text-gray-400">Transaction ID:</span>
                                <span className="font-mono text-xs text-gray-300 break-all bg-black/20 p-2 rounded border border-white/10">{donation.txId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-6 max-w-md mx-auto">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-gray-400 font-medium mb-2">No Direct Donations Yet</h3>
                        <p className="text-gray-500 text-sm">
                          Your ticket purchases include charitable contributions. Visit the Events tab to see your impact.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NFT Tickets Tab */}
              {activeTab === 'nfts' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">My NFT Tickets</h2>

                  {nftTickets.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {nftTickets.map((nft) => (
                        <div key={nft.id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                          <img
                            src={nft.image}
                            alt={nft.eventTitle}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg';
                            }}
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-white mb-2">{nft.eventTitle}</h3>
                            <p className="text-sm text-gray-400 mb-3">{format(nft.date, 'MMM dd, yyyy')}</p>

                            <div className="flex flex-col space-y-3">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${nft.status === 'used'
                                  ? 'bg-gray-600/20 text-gray-400'
                                  : 'bg-green-600/20 text-green-400'
                                  }`}>
                                  {nft.status === 'used' ? 'Used' : 'Active'}
                                </span>
                              </div>

                              <div className="flex flex-col space-y-2">
                                <div className="flex flex-col space-y-1">
                                  <span className="text-xs text-gray-400">NFT Token ID:</span>
                                  <span className="text-xs text-gray-300 font-mono break-all bg-black/20 p-2 rounded border border-white/10">{nft.id}</span>
                                </div>

                                {nft.txId && (
                                  <div className="flex flex-col space-y-1">
                                    <span className="text-xs text-gray-400">Transaction ID:</span>
                                    <span className="text-xs text-gray-300 font-mono break-all bg-black/20 p-2 rounded border border-white/10">{nft.txId}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-6 max-w-md mx-auto">
                        <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-gray-400 font-medium mb-2">No NFT Tickets Yet</h3>
                        <p className="text-gray-500 text-sm">
                          Purchase event tickets to start collecting unique NFT tickets for your events.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
