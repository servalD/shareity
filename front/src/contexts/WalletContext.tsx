import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { Client, xrpToDrops } from 'xrpl';
import { useAuth } from './AuthContext';
import { XummTypes } from 'xumm-sdk';
import { ResolvedFlow } from 'xumm-oauth2-pkce';

// Helpers
export async function sendTx(payload: XummTypes.XummPostPayloadBodyJson, sdk: ResolvedFlow['sdk']): Promise<string | undefined> {
  const payloadSubscripted = await sdk.payload.createAndSubscribe(
    payload,
    evt => ('signed' in evt.data ? evt.data : undefined)
  );
  await payloadSubscripted.resolved;
  return payloadSubscripted.payload.response.txid || undefined;
}

// --- Wallet Context Types ---
interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: 'testnet' | 'mainnet';
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendPayment: (destination: string, amount: number) => Promise<string>;
  mintNFT: (metadata: Record<string, unknown>) => Promise<string>;
  createEscrow: (destination: string, amount: number, finishAfterSeconds: number) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * WalletProvider manages on-chain wallet operations:
 * - initializes XRPL client when AuthContext.sdk is ready
 * - fetches account balance
 * - sends payments and mints NFTs via Xumm SDK
 * - creates escrow transactions
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { sdk, user, authorize, logout } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [network] = useState<'testnet' | 'mainnet'>('testnet');
  const clientRef = useRef<Client | null>(null);

  /**
   * Fetches and updates the account balance (in XRP)
   */
  const refreshBalance = useCallback(async () => {
    if (!clientRef.current || !address) {
      console.log('⚠️ Cannot refresh balance: client or address missing', {
        hasClient: !!clientRef.current,
        address
      });
      return;
    }
    try {
      console.log('💰 Fetching balance for address:', address);
      const resp = await clientRef.current.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      const drops = resp.result.account_data.Balance;
      const balanceXRP = Number(drops) / 1_000_000;
      console.log('✅ Balance fetched:', balanceXRP, 'XRP');
      setBalance(balanceXRP);
    } catch (err) {
      console.error('❌ Failed to fetch balance', err);
    }
  }, [address]);

  // Initialize XRPL client and load balance when sdk and user are available
  useEffect(() => {
    const initializeWallet = async () => {
      if (sdk && user?.walletAddress) {
        console.log('🔗 Initializing wallet for address:', user.walletAddress);
        setIsConnected(true);
        setAddress(user.walletAddress);

        const wsUrl = network === 'mainnet'
          ? 'wss://s1.ripple.com'
          : 'wss://s.altnet.rippletest.net';
        const client = new Client(wsUrl);
        clientRef.current = client;

        try {
          await client.connect();
          console.log('🌐 XRPL client connected, fetching balance...');
          await refreshBalance();
        } catch (error) {
          console.error('❌ Failed to connect XRPL client or fetch balance:', error);
        }
      }
    };

    initializeWallet();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [sdk, user, network, refreshBalance]);

  /**
   * Reconnects wallet (no-op if already connected)
   */
  const connectWallet = useCallback(async (): Promise<void> => {
    console.log('🔄 connectWallet called');
    try {
      await authorize();
      console.log('✅ Authorization successful, current user:', user);
      if (sdk && user?.walletAddress) {
        console.log('💰 Refreshing balance after connection...');
        await refreshBalance();
      }
    } catch (error) {
      console.error('❌ Failed to authorize:', error);
    }
  }, [authorize, sdk, user, refreshBalance]);

  /**
   * Disconnects wallet and clears state
   */
  const disconnectWallet = useCallback(() => {
    logout();
    setIsConnected(false);
    setAddress(null);
    setBalance(0);
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  /**
   * Sends a Payment transaction via Xumm payload
   * @param destination - XRP Ledger destination address
   * @param amount - amount in XRP
   * @returns transaction hash
   */
  const sendPayment = useCallback(async (destination: string, amount: number): Promise<string> => {
    if (!sdk || !address) throw new Error('Wallet not connected');
    const txId = await sendTx({
      txjson: {
        TransactionType: 'Payment',
        Account: address,
        Destination: destination,
        Amount: xrpToDrops(amount).toString()
      }
    }, sdk)
    if (txId) {
      await refreshBalance();
      return txId;
    }
    throw new Error('Payment transaction was rejected');
  }, [sdk, address, refreshBalance]);

  /**
   * Mints an NFT via NFTokenMint transaction
   * @param metadata - JSON metadata to embed in the NFT URI
   * @returns transaction hash
   */
  const mintNFT = useCallback(async (metadata: Record<string, unknown>): Promise<string> => {
    console.log('🎨 mintNFT called with metadata:', metadata);

    if (!sdk || !address) {
      const error = `Wallet not connected - sdk: ${!!sdk}, address: ${address}`;
      console.error('❌ mintNFT error:', error);
      throw new Error(error);
    }

    try {
      // Utiliser TextEncoder au lieu de Buffer pour la compatibilité navigateur
      const encoder = new TextEncoder();
      const jsonString = JSON.stringify(metadata);
      const uint8Array = encoder.encode(jsonString);

      // Convertir en hexadécimal
      const uriHex = Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      console.log('🔗 URI hex generated:', uriHex);
      console.log('📏 URI length:', uriHex.length, 'characters');

      console.log('📝 Creating NFT transaction payload...');
      const txId = await sendTx({
        txjson: {
          TransactionType: 'NFTokenMint',
          Account: address,
          URI: uriHex
        }
      }, sdk);

      console.log('📤 NFT transaction sent, txId:', txId);
      if (txId) return txId;
      throw new Error('NFT mint transaction was rejected');
    } catch (error) {
      console.error('❌ Error in mintNFT:', error);
      throw error;
    }
  }, [sdk, address]);

  /**
   * Creates an EscrowCreate transaction via Xumm payload
   * @param destination - XRP Ledger destination address
   * @param amount - amount in XRP
   * @param finishAfterSeconds - time in seconds from now when escrow can be finished
   * @returns transaction hash
   */
  const createEscrow = useCallback(async (
    destination: string,
    amount: number,
    finishAfterSeconds: number
  ): Promise<string> => {
    if (!sdk || !address) throw new Error('Wallet not connected');
    const unixTime = Math.floor(Date.now() / 1000) + finishAfterSeconds;
    const rippleEpoch = unixTime - 946684800;
    const txId = await sendTx({
      txjson: {
        TransactionType: 'EscrowCreate',
        Account: address,
        Destination: destination,
        Amount: xrpToDrops(amount).toString(),
        FinishAfter: rippleEpoch
      }
    }, sdk);
    if (txId) {
      await refreshBalance();
      return txId;
    }
    throw new Error('Escrow creation was rejected');
  }, [sdk, address, refreshBalance]);

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    network,
    connectWallet,
    disconnectWallet,
    sendPayment,
    mintNFT,
    createEscrow
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export default WalletContext;
