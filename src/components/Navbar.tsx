import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet as WalletIcon, User as UserIcon, Menu, X, Shield, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
// import DIDModal from './DIDModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, authorize, logout } = useAuth();
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDIDModalOpen, setIsDIDModalOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Calendar },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Causes', href: '/causes', icon: Heart },
  ];
  const isActive = (path: string) => location.pathname === path;
  console.log(isAuthenticated, user, isConnected, address, balance);

  return (
    <>
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">XRPL Toolkit</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${isActive(item.href)
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth & Wallet Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Connect DID if not authenticated */}
              {!isAuthenticated ? (
                <>
                  {/* Connect Wallet if DID connected but wallet not */}
                  {!isConnected ? (
                    <button
                      onClick={connectWallet}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200"
                    >
                      <WalletIcon className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-300">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                        <div className="text-xs text-green-400">{balance} XRP</div>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      {/* Optionally include logout */}
                      <button
                        onClick={logout}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setIsDIDModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Connect DID</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/30 backdrop-blur-lg border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              {navigation.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${isActive(item.href)
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-white/10">
                {!isAuthenticated ? (
                  <button
                    onClick={() => {
                      setIsDIDModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Connect DID</span>
                  </button>
                ) : !isConnected ? (
                  <button
                    onClick={() => {
                      connectWallet();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg"
                  >
                    <WalletIcon className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                ) : (
                  <div className="w-full">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg mb-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-center text-red-500 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* <DIDModal isOpen={isDIDModalOpen} onClose={() => setIsDIDModalOpen(false)} /> */}
    </>
  );
};

export default Navbar;
