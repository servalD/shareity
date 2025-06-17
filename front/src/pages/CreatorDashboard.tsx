import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, TrendingUp, Plus, Edit, Eye, BarChart3, Heart } from 'lucide-react';
import { format } from 'date-fns';

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const creatorStats = {
    totalEvents: 8,
    totalRevenue: 12500,
    totalAttendees: 1247,
    charityRaised: 3750
  };

  const myEvents = [
    {
      id: '1',
      title: 'Tech for Good Conference 2024',
      date: new Date('2024-03-15'),
      status: 'live',
      registered: 342,
      capacity: 500,
      revenue: 17100,
      charityAmount: 5130,
      cause: 'Digital Literacy for Rural Communities'
    },
    {
      id: '2',
      title: 'Blockchain Workshop',
      date: new Date('2024-03-20'),
      status: 'upcoming',
      registered: 78,
      capacity: 100,
      revenue: 1950,
      charityAmount: 487.5,
      cause: 'Education for All'
    },
    {
      id: '3',
      title: 'Green Energy Summit',
      date: new Date('2024-04-02'),
      status: 'draft',
      registered: 0,
      capacity: 300,
      revenue: 0,
      charityAmount: 0,
      cause: 'Climate Action Initiative'
    }
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'ticket_sale',
      amount: 50,
      event: 'Tech for Good Conference 2024',
      date: new Date('2024-03-12'),
      txId: 'tx_sale_001'
    },
    {
      id: '2',
      type: 'escrow_release',
      amount: 1500,
      event: 'Previous Workshop',
      date: new Date('2024-03-10'),
      txId: 'tx_escrow_001'
    },
    {
      id: '3',
      type: 'charity_distribution',
      amount: 450,
      event: 'Previous Workshop',
      date: new Date('2024-03-10'),
      txId: 'tx_charity_001'
    }
  ];

  

  const analytics = {
    monthlyRevenue: [
      { month: 'Jan', revenue: 2500, charity: 750 },
      { month: 'Feb', revenue: 3200, charity: 960 },
      { month: 'Mar', revenue: 4100, charity: 1230 },
      { month: 'Apr', revenue: 2800, charity: 840 }
    ],
    topCauses: [
      { name: 'Digital Literacy', amount: 1500, events: 3 },
      { name: 'Clean Water', amount: 1200, events: 2 },
      { name: 'Education', amount: 1050, events: 3 }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: DollarSign }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-600/20 text-green-400';
      case 'upcoming': return 'bg-blue-600/20 text-blue-400';
      case 'draft': return 'bg-yellow-600/20 text-yellow-400';
      case 'completed': return 'bg-gray-600/20 text-gray-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Creator Dashboard</h1>
            <p className="text-xl text-gray-400">
              Manage your events and track their impact
            </p>
          </div>
          <Link
            to="/create-event"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-white">{creatorStats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white">{creatorStats.totalRevenue.toLocaleString()} XRP</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Total Attendees</p>
                <p className="text-3xl font-bold text-white">{creatorStats.totalAttendees.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-400 text-sm font-medium">Charity Raised</p>
                <p className="text-3xl font-bold text-white">{creatorStats.charityRaised.toLocaleString()} XRP</p>
              </div>
              <Heart className="w-8 h-8 text-pink-400" />
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
              <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
              
              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Link
                  to="/create-event"
                  className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-lg hover:border-blue-400/30 transition-all duration-200 group"
                >
                  <Plus className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-white mb-2">Create New Event</h3>
                  <p className="text-gray-400 text-sm">Start planning your next impactful event</p>
                </Link>

                <div className="p-6 bg-gradient-to-r from-green-600/20 to-teal-600/20 border border-green-500/20 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
                  <p className="text-gray-400 text-sm">Track performance and impact metrics</p>
                </div>

                <div className="p-6 bg-gradient-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/20 rounded-lg">
                  <Heart className="w-8 h-8 text-pink-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Charity Impact</h3>
                  <p className="text-gray-400 text-sm">See how your events help causes</p>
                </div>
              </div>

              {/* Recent Events */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Events</h3>
                <div className="space-y-4">
                  {myEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="font-medium text-white">{event.title}</h4>
                          <p className="text-sm text-gray-400">{format(event.date, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <div className="text-right">
                          <p className="text-sm text-white">{event.registered}/{event.capacity}</p>
                          <p className="text-xs text-gray-400">registered</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Events</h2>
                <Link
                  to="/create-event"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Event</span>
                </Link>
              </div>
              
              <div className="space-y-4">
                {myEvents.map((event) => (
                  <div key={event.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-white/10 text-gray-400 rounded-lg hover:text-white hover:bg-white/20 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white/10 text-gray-400 rounded-lg hover:text-white hover:bg-white/20 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-white/5 rounded">
                        <p className="text-2xl font-bold text-white">{event.registered}</p>
                        <p className="text-xs text-gray-400">Registered</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded">
                        <p className="text-2xl font-bold text-white">{event.capacity}</p>
                        <p className="text-xs text-gray-400">Capacity</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded">
                        <p className="text-2xl font-bold text-green-400">{event.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Revenue (XRP)</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded">
                        <p className="text-2xl font-bold text-pink-400">{event.charityAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">To Charity (XRP)</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Date: {format(event.date, 'MMM dd, yyyy')}</span>
                      <span>Supporting: {event.cause}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">Analytics & Insights</h2>
              
              {/* Revenue Chart */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue & Charity Impact</h3>
                <div className="grid grid-cols-4 gap-4">
                  {analytics.monthlyRevenue.map((month, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-2">
                        <div className="w-full bg-gray-700 rounded h-20 flex flex-col justify-end overflow-hidden">
                          <div 
                            className="bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                            style={{ height: `${(month.revenue / 5000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white">{month.month}</p>
                      <p className="text-xs text-gray-400">{month.revenue} XRP</p>
                      <p className="text-xs text-green-400">{month.charity} to charity</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Causes */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Supported Causes</h3>
                <div className="space-y-4">
                  {analytics.topCauses.map((cause, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{cause.name}</h4>
                        <p className="text-sm text-gray-400">{cause.events} events</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{cause.amount} XRP</p>
                        <p className="text-xs text-gray-400">raised</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-white mb-2">Average Attendance</h4>
                  <p className="text-3xl font-bold text-blue-400">78%</p>
                  <p className="text-sm text-gray-400">capacity filled</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-white mb-2">Charity Impact</h4>
                  <p className="text-3xl font-bold text-green-400">30%</p>
                  <p className="text-sm text-gray-400">average to charity</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-white mb-2">Event Success Rate</h4>
                  <p className="text-3xl font-bold text-purple-400">95%</p>
                  <p className="text-sm text-gray-400">events completed</p>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Transaction History</h2>
              
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-6 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          tx.type === 'ticket_sale' ? 'bg-blue-400' :
                          tx.type === 'escrow_release' ? 'bg-green-400' :
                          'bg-pink-400'
                        }`}></div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {tx.type === 'ticket_sale' ? 'Ticket Sale' :
                             tx.type === 'escrow_release' ? 'Escrow Release' :
                             'Charity Distribution'}
                          </h3>
                          <p className="text-sm text-gray-400">{tx.event}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{tx.amount} XRP</p>
                        <p className="text-sm text-gray-400">{format(tx.date, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 font-mono">
                      Transaction ID: {tx.txId}
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

export default CreatorDashboard;