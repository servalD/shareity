import { useState } from 'react';
import { Calendar, Heart, Ticket, TrendingUp, Star } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const userStats = {
    eventsAttended: 12,
    totalDonated: 450,
    causesSupported: 8,
    nftTickets: 12
  };

  const recentEvents = [
    {
      id: '1',
      title: 'Tech for Good Conference 2024',
      date: new Date('2024-03-15'),
      status: 'attended',
      ticketPrice: 50,
      charityAmount: 15,
      nftId: 'nft_abc123'
    },
    {
      id: '2',
      title: 'Blockchain Workshop',
      date: new Date('2024-03-20'),
      status: 'upcoming',
      ticketPrice: 25,
      charityAmount: 6.25,
      nftId: 'nft_def456'
    },
    {
      id: '3',
      title: 'Charity Marathon',
      date: new Date('2024-03-25'),
      status: 'upcoming',
      ticketPrice: 15,
      charityAmount: 7.5,
      nftId: 'nft_ghi789'
    }
  ];

  const donations = [
    {
      id: '1',
      cause: 'Digital Literacy for Rural Communities',
      amount: 100,
      date: new Date('2024-03-10'),
      txId: 'tx_donation_001'
    },
    {
      id: '2',
      cause: 'Clean Water Access Initiative',
      amount: 75,
      date: new Date('2024-03-05'),
      txId: 'tx_donation_002'
    },
    {
      id: '3',
      cause: 'Reforestation Project',
      amount: 50,
      date: new Date('2024-02-28'),
      txId: 'tx_donation_003'
    }
  ];

  const nftTickets = [
    {
      id: 'nft_abc123',
      eventTitle: 'Tech for Good Conference 2024',
      date: new Date('2024-03-15'),
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
      status: 'used'
    },
    {
      id: 'nft_def456',
      eventTitle: 'Blockchain Workshop',
      date: new Date('2024-03-20'),
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
      status: 'active'
    },
    {
      id: 'nft_ghi789',
      eventTitle: 'Charity Marathon',
      date: new Date('2024-03-25'),
      image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg',
      status: 'active'
    }
  ];

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
                <p className="text-3xl font-bold text-white">{userStats.totalDonated} XRP</p>
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
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
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
                        <p className="text-sm text-white">{event.ticketPrice} XRP</p>
                        <p className="text-xs text-green-400">{event.charityAmount} XRP to charity</p>
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'attended' 
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
                        Ticket: {event.ticketPrice} XRP
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Heart className="w-4 h-4 mr-2 text-green-400" />
                        Donated: {event.charityAmount} XRP
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white/5 rounded text-xs text-gray-400">
                      NFT Ticket ID: {event.nftId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">My Donations</h2>
              
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{donation.cause}</h3>
                      <span className="text-2xl font-bold text-green-400">{donation.amount} XRP</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{format(donation.date, 'MMM dd, yyyy')}</span>
                      <span className="font-mono">TX: {donation.txId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NFT Tickets Tab */}
          {activeTab === 'nfts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">My NFT Tickets</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftTickets.map((nft) => (
                  <div key={nft.id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    <img
                      src={nft.image}
                      alt={nft.eventTitle}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2">{nft.eventTitle}</h3>
                      <p className="text-sm text-gray-400 mb-3">{format(nft.date, 'MMM dd, yyyy')}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          nft.status === 'used' 
                            ? 'bg-gray-600/20 text-gray-400' 
                            : 'bg-green-600/20 text-green-400'
                        }`}>
                          {nft.status === 'used' ? 'Used' : 'Active'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{nft.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;