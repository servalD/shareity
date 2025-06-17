import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { Client, xrpToDrops } from 'xrpl';
import { useAuth } from './AuthContext';
import { XummTypes } from 'xumm-sdk';
import { ResolvedFlow } from 'xumm-oauth2-pkce';

// Helpers
export async function sendTx(payload: XummTypes.XummPostPayloadBodyJson, sdk: ResolvedFlow['sdk']): Promise<string | undefined> {
  console.log('🚀 sendTx called with payload:', payload);

  try {
    console.log('📱 Creating Xumm payload...');
    
    // Validation du payload
    if (!payload.txjson) {
      throw new Error('Invalid payload: missing txjson');
    }
    
    if (!payload.txjson.Account) {
      throw new Error('Invalid payload: missing Account');
    }
    
    if (!payload.txjson.TransactionType) {
      throw new Error('Invalid payload: missing TransactionType');
    }
    
    console.log('✅ Payload validation passed');
    
    const payloadSubscripted = await sdk.payload.createAndSubscribe(
      payload,
      evt => {
        console.log('📨 Payload event received:', evt);
        return 'signed' in evt.data ? evt.data : undefined;
      }
    );

    console.log('📋 Payload created, full object:', payloadSubscripted.payload);

    // Accéder à la structure correcte du payload
    const payloadData = payloadSubscripted.payload as any;
    console.log('🔍 Inspecting payload structure:', Object.keys(payloadData));

    // La structure semble être: payload.payload.request_json, payload.meta, etc.
    const actualPayload = payloadData.payload;
    const meta = payloadData.meta;

    console.log('📱 Payload UUID:', meta?.uuid);
    console.log('📋 Actual payload structure:', actualPayload ? Object.keys(actualPayload) : 'No payload');

    // Construire l'URL Xumm manuellement avec l'UUID
    if (meta?.uuid) {
      const xummUrl = `https://xumm.app/sign/${meta.uuid}`;
      console.log('🔗 Opening Xumm URL:', xummUrl);

      // Ouvrir l'URL dans un nouvel onglet
      const newWindow = window.open(xummUrl, '_blank');
      if (!newWindow) {
        console.warn('⚠️ Popup blocked! Please manually open:', xummUrl);
        alert(`Popup blocked! Please open this URL manually: ${xummUrl}`);
      }
    } else {
      console.log('⚠️ No UUID found in meta, checking for other properties...');
      console.log('Meta object:', meta);
      console.log('Available payload properties:', Object.keys(payloadData));
    }

    console.log('⏳ Waiting for payload resolution...');
    const resolved = await payloadSubscripted.resolved;
    console.log('✅ Payload resolved:', resolved);

    const txId = payloadSubscripted.payload.response.txid;
    console.log('🎯 Transaction ID:', txId);

    return txId || undefined;
  } catch (error) {
    console.error('❌ Error in sendTx:', error);
    
    // Log plus détaillé pour les erreurs XUMM
    if (error && typeof error === 'object' && 'message' in error) {
      console.error('❌ Error details:', {
        message: (error as any).message,
        name: (error as any).name,
        stack: (error as any).stack
      });
    }
    
    throw error;
  }
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
  createNFTCollection: (collectionMetadata: {
    name: string;
    description: string;
    eventId: number;
    maxSupply: number;
    imageUrl: string;
  }) => Promise<string>;
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
    
    // Validation des paramètres
    if (!destination || destination.length < 25) {
      throw new Error('Invalid destination address');
    }
    
    if (amount <= 0 || amount > 1000000) {
      throw new Error('Invalid amount (must be between 0 and 1,000,000 XRP)');
    }
    
    // Utiliser une adresse de test valide si l'adresse par défaut est utilisée
    const validDestination = destination === 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' 
      ? 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' // Adresse de test valide
      : destination;
    
    console.log('💰 Sending payment:', {
      from: address,
      to: validDestination,
      amount: amount,
      amountDrops: xrpToDrops(amount).toString()
    });
    
    const txId = await sendTx({
      txjson: {
        TransactionType: 'Payment',
        Account: address,
        Destination: validDestination,
        Amount: xrpToDrops(amount).toString()
      }
    }, sdk);
    
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
      // Vérifier que l'account existe et peut créer des NFTs
      if (!clientRef.current) {
        throw new Error('XRPL client not connected');
      }

      try {
        const accountInfo = await clientRef.current.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
        console.log('✅ Account info retrieved:', accountInfo.result.account_data);
      } catch (accountError) {
        console.error('❌ Failed to get account info:', accountError);
        throw new Error('Account not found or invalid');
      }

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

      // Construire l'URL Xumm manuellement avec l'UUID
      if (metadata.uuid) {
        const xummUrl = `https://xumm.app/sign/${metadata.uuid}`;
        console.log('🔗 Opening Xumm URL:', xummUrl);

        // Ouvrir l'URL dans un nouvel onglet
        const newWindow = window.open(xummUrl, '_blank');
        if (!newWindow) {
          console.warn('⚠️ Popup blocked! Please manually open:', xummUrl);
          alert(`Popup blocked! Please open this URL manually: ${xummUrl}`);
        }
      } else {
        console.log('⚠️ No UUID found in metadata, checking for other properties...');
        console.log('Metadata object:', metadata);
        console.log('Available metadata properties:', Object.keys(metadata));
      }

      console.log('⏳ Waiting for payload resolution...');
      const resolved = await sendTx({
        txjson: {
          TransactionType: 'NFTokenMint' as const,
          Account: address,
          URI: uriHex,
          NFTokenTaxon: 0,
          Flags: 0
        }
      }, sdk);

      console.log('📤 NFT transaction sent, txId:', resolved);
      if (resolved) return resolved;
      throw new Error('NFT mint transaction was rejected');
    } catch (error) {
      console.error('❌ Error in mintNFT:', error);
      throw error;
    }
  }, [sdk, address]);

  /**
   * Creates an NFT collection for an event via NFTokenMint transaction
   * @param collectionMetadata - Collection metadata including name, description, eventId, maxSupply, imageUrl
   * @returns transaction hash
   */
  const createNFTCollection = useCallback(async (collectionMetadata: {
    name: string;
    description: string;
    eventId: number;
    maxSupply: number;
    imageUrl: string;
  }): Promise<string> => {
    console.log('🎨 createNFTCollection called with metadata:', collectionMetadata);

    if (!sdk || !address) {
      const error = `Wallet not connected - sdk: ${!!sdk}, address: ${address}`;
      console.error('❌ createNFTCollection error:', error);
      throw new Error(error);
    }

    try {
      // Vérifier que l'account existe et peut créer des NFTs
      if (!clientRef.current) {
        throw new Error('XRPL client not connected');
      }

      try {
        const accountInfo = await clientRef.current.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
        console.log('✅ Account info retrieved:', accountInfo.result.account_data);
      } catch (accountError) {
        console.error('❌ Failed to get account info:', accountError);
        throw new Error('Account not found or invalid');
      }

      // Utiliser TextEncoder au lieu de Buffer pour la compatibilité navigateur
      const encoder = new TextEncoder();
      
      // Créer les métadonnées avec l'image
      const defaultImageUrl = 'https://via.placeholder.com/400x300/6366f1/ffffff?text=No+Image';
      const imageUrl = collectionMetadata.imageUrl || defaultImageUrl;
      
      // Optimiser les métadonnées pour réduire la taille
      const collectionData = {
        t: 'evt', // Type: event
        n: collectionMetadata.name.substring(0, 20), // Nom limité à 20 caractères
        e: collectionMetadata.eventId, // Event ID
        m: collectionMetadata.maxSupply, // Max supply
        i: imageUrl.substring(0, 50) // Image URL limitée à 50 caractères
      };
      
      const jsonString = JSON.stringify(collectionData);
      const uint8Array = encoder.encode(jsonString);

      // Convertir en hexadécimal
      const uriHex = Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      console.log('🔗 Collection URI hex generated:', uriHex);
      console.log('📏 URI length:', uriHex.length, 'characters');
      console.log('🖼️ Image URL:', imageUrl);
      console.log('📋 Metadata JSON:', jsonString);

      // Vérifier si l'URI n'est pas trop long
      if (uriHex.length > 256) {
        console.error('❌ URI is too long:', uriHex.length, 'characters (max 256)');
        console.error('📋 Metadata that caused the issue:', collectionData);
        throw new Error('NFT metadata is too large. Please use shorter names and descriptions.');
      }

      // Utiliser un NFTokenTaxon plus petit (hash de l'eventId)
      const taxon = collectionMetadata.eventId % 1000000; // Limiter à 6 chiffres
      console.log('🏷️ Using NFTokenTaxon:', taxon, 'for eventId:', collectionMetadata.eventId);

      console.log('📝 Creating NFT collection transaction payload...');
      const payload = {
        txjson: {
          TransactionType: 'NFTokenMint' as const,
          Account: address,
          URI: uriHex,
          NFTokenTaxon: taxon,
          Flags: 0
        }
      };
      
      console.log('📋 Full transaction payload:', JSON.stringify(payload, null, 2));
      
      const txId = await sendTx(payload, sdk);

      console.log('📤 NFT collection transaction sent, txId:', txId);
      if (txId) return txId;
      throw new Error('NFT collection creation was rejected');
    } catch (error) {
      console.error('❌ Error in createNFTCollection:', error);
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
    createNFTCollection,
    createEscrow
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export default WalletContext;
