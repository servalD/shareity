import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Shield, Zap, Users, TrendingUp, ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Decentralized Identity',
      description: 'Secure XRPL DID authentication for complete ownership of your digital identity.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create and manage events with built-in ticketing and donation systems.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: Heart,
      title: 'Charitable Causes',
      description: 'Support meaningful causes through transparent, blockchain-based donations.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Zap,
      title: 'NFT Tickets',
      description: 'Purchase unique NFT tickets that serve as proof of attendance and support.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Users,
      title: 'Multi-Escrow Splits',
      description: 'Automatic fund distribution to venues, services, and charitable causes.',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Track event performance, donations, and impact with live dashboards.',
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  const stats = [
    { label: 'Events Created', value: '2,847', icon: Calendar },
    { label: 'Funds Raised', value: '₹1.2M', icon: TrendingUp },
    { label: 'Causes Supported', value: '156', icon: Heart },
    { label: 'NFT Tickets Sold', value: '18,392', icon: Star }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Decentralized Events for
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Charitable Impact</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create, attend, and support events that make a difference. Built on XRPL with decentralized identity, 
              NFT ticketing, and transparent fund distribution to charitable causes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/causes"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                Browse Causes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <Icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powered by XRPL Technology
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the future of event management with blockchain-powered transparency, 
              security, and charitable impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple steps to create impact through decentralized events
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Connect & Create</h3>
              <p className="text-gray-400">
                Set up your XRPL DID, connect your wallet, and create events or causes that matter to you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Participate & Support</h3>
              <p className="text-gray-400">
                Purchase NFT tickets, make donations, and participate in events that support charitable causes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Track Impact</h3>
              <p className="text-gray-400">
                Monitor real-time fund distribution and see the direct impact of your participation on charitable causes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users creating positive change through decentralized events and charitable giving.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-event"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Create Your First Event
              </Link>
              <Link
                to="/create-cause"
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200"
              >
                Start a Cause
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;