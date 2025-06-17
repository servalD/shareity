import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { ResolvedFlow, XummPkce } from 'xumm-oauth2-pkce';

// --- Types ---
interface User {
  id: string;
  did: string;
  walletAddress?: string;
  name?: string;
  email?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sdk: ResolvedFlow['sdk'] | null;
  authorize: () => Promise<ResolvedFlow | undefined>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// --- Context Setup ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  apiKey: string;
}

// --- AuthProvider Implementation ---
export const AuthProvider: React.FC<AuthProviderProps> = ({ children, apiKey }) => {
  // Xumm PKCE auth instance
  const [auth] = useState(() => new XummPkce(apiKey, "https://localhost:3000/"));
  // Local state
  const [user, setUser] = useState<User | null>(null);
  const [sdk, setSdk] = useState<any | null>(null);

  // On mount: restore stored user
  useEffect(() => {
    const stored = localStorage.getItem('xrpl-user');
    if (stored) {
      const parsed: User = JSON.parse(stored);
      parsed.createdAt = new Date(parsed.createdAt);
      setUser(parsed);
    }

    // Listen to PKCE events
    auth.on('error', console.error);
    auth.on('success', async () => {
      const state = await auth.state();
      if (state && state.me && state.sdk) {
        // On first-time signin or redirect
        handleAuthorized(state);
      }
    });
    auth.on('retrieved', async () => {
      const state = await auth.state();
      if (state && state.me && state.sdk) {
        handleAuthorized(state);
      }
    });
  }, [auth]);

  // Common handler when auth is successful
  const handleAuthorized = (authorized: ResolvedFlow) => {
    const { me, sdk } = authorized;
    console.log('🔑 Auth successful, user data:', me);
    // Build or update User
    const newUser: User = {
      id: user?.id || Math.random().toString(36).slice(2, 9),
      did: me.profile?.slug || "Unknown", // ou tout autre champ DID exposé par Xumm
      walletAddress: me.account,
      name: me.name || undefined,
      email: me.email,
      createdAt: user?.createdAt || new Date(),
    };
    console.log('👤 Setting new user:', newUser);
    setUser(newUser);
    setSdk(sdk);
    localStorage.setItem('xrpl-user', JSON.stringify(newUser));
  };

  // Launch PKCE flow
  const authorize = useCallback(async () => {
    console.log('🚀 Starting authorization flow...');
    return auth.authorize();
  }, [auth]);

  // Logout
  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setSdk(null);
    localStorage.removeItem('xrpl-user');
  }, [auth]);

  // Update partial user data
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('xrpl-user', JSON.stringify(updated));
  };

  // Provide context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    sdk,
    authorize,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
