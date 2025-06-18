import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { Client, xrpToDrops } from 'xrpl';
import { useAuth } from './AuthContext';
import { XummTypes } from 'xumm-sdk';
import { ResolvedFlow } from 'xumm-oauth2-pkce';
import { Ticket } from 'xrpl/dist/npm/models/ledger';
import { EventService } from '../services/events.service';
import { ServiceErrorCode } from '../services/service.result';

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
  createTicket: (ticketCount?: number) => Promise<Ticket[]>;
  batchMintNFT: (metadataList: Record<string, unknown>[], tickets: Ticket[]) => Promise<string[]>;
  batchCreateOffer: (offers: Array<{
    nftokenId: string;
    amount: number;
    destination?: string;
    flags?: number;
  }>, tickets: Ticket[]) => Promise<string[]>;
  createNFTCollection: (collectionMetadata: {
    name: string;
    description: string;
    eventId: number;
    maxSupply: number;
    imageUrl: string;
  }) => Promise<string>;
  buyNFT: (nftOfferIndex: string) => Promise<string>;
  // getEventTickets: (eventId: number, backendAddress: string) => Promise<Array<{
  //   NFTokenID: string;
  //   taxon: number;
  //   ticketIndex: number;
  //   uri?: string;
  //   metadata?: any;
  // }>>;
  createCompleteEventSetup: (eventMetadata: {
    name: string;
    description: string;
    eventId: number;
    maxSupply: number;
    imageUrl: string;
    ticketPrice: number;
  }) => Promise<{
    collectionTxId: string;
    ticketNFTIds: string[];
    offerTxIds: string[];
  }>;
  findFirstTicketWithSellOffer: (eventId: number, backendAddress: string) => Promise<{ nft_offer_index: string; NFTokenID: string } | null>;
  deployEventWithBackend: (eventMetadata: {
    name: string;
    description: string;
    eventId: number;
    maxSupply: number;
    imageUrl: string;
    ticketPrice: number;
  }) => Promise<{
    collectionTxId: string;
    ticketNFTIds: string[];
    offerTxIds: string[];
    totalCost: number;
  }>;
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

    // Round amount to 6 decimal places to avoid floating-point precision issues
    const roundedAmount = Math.round(amount * 1000000) / 1000000;

    // Utiliser une adresse de test valide si l'adresse par défaut est utilisée
    const validDestination = destination === 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      ? 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' // Adresse de test valide
      : destination;

    console.log('💰 Sending payment:', {
      from: address,
      to: validDestination,
      amount: roundedAmount,
      amountDrops: xrpToDrops(roundedAmount).toString()
    });

    const txId = await sendTx({
      txjson: {
        TransactionType: 'Payment',
        Account: address,
        Destination: validDestination,
        Amount: xrpToDrops(roundedAmount).toString()
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
   * Creates a Ticket via TicketCreate transaction
   * @param ticketCount - number of tickets to create (optional, defaults to 1)
   * @returns transaction hash
   */
  const createTicket = useCallback(async (ticketCount: number = 1): Promise<Ticket[]> => {
    console.log('🎫 createTicket called with count:', ticketCount);

    if (!sdk || !address) {
      const error = `Wallet not connected - sdk: ${!!sdk}, address: ${address}`;
      console.error('❌ createTicket error:', error);
      throw new Error(error);
    }

    try {
      // Vérifier que l'account existe
      if (!clientRef.current) {
        throw new Error('XRPL client not connected');
      }

      try {
        const accountInfo = await clientRef.current.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
        console.log('✅ Account info retrieved for ticket creation:', accountInfo.result.account_data);
      } catch (accountError) {
        console.error('❌ Failed to get account info:', accountError);
        throw new Error('Account not found or invalid');
      }

      // Valider le nombre de tickets
      if (ticketCount < 1 || ticketCount > 250) {
        throw new Error('Invalid ticket count (must be between 1 and 250)');
      }

      console.log('📝 Creating TicketCreate transaction payload...');
      const payload = {
        txjson: {
          TransactionType: 'TicketCreate' as const,
          Account: address,
          TicketCount: ticketCount
        }
      };

      console.log('📋 Full TicketCreate payload:', JSON.stringify(payload, null, 2));

      const txId = await sendTx(payload, sdk);

      // Après la transaction, récupérer les tickets créés
      if (txId) {
        console.log('🎫 Fetching created tickets for account:', address);
        const ticketsResponse = await clientRef.current.request({
          command: 'account_objects',
          account: address,
          type: 'ticket',
          ledger_index: 'validated'
        });

        const tickets = ticketsResponse.result.account_objects as Ticket[];
        console.log('✅ Tickets retrieved:', tickets);

        return tickets;
      }
      throw new Error('Ticket creation was rejected');
    } catch (error) {
      console.error('❌ Error in createTicket:', error);
      throw error;
    }
  }, [sdk, address, refreshBalance]);

  /**
   * Mints multiple NFTs in batch using pre-created tickets
   * @param metadataList - Array of metadata objects for each NFT
   * @param tickets - Array of tickets to use for the transactions
   * @returns array of transaction hashes
   */
  const batchMintNFT = useCallback(async (
    metadataList: Record<string, unknown>[],
    tickets: Ticket[],
    taxonBase: number = 0
  ): Promise<string[]> => {
    console.log('🎨 batchMintNFT called with metadata count:', metadataList.length);
    console.log('🎫 Available tickets:', tickets.length);

    if (!sdk || !address) {
      const error = `Wallet not connected - sdk: ${!!sdk}, address: ${address}`;
      console.error('❌ batchMintNFT error:', error);
      throw new Error(error);
    }

    if (metadataList.length === 0) {
      throw new Error('No metadata provided for minting');
    }

    if (tickets.length < metadataList.length) {
      throw new Error(`Not enough tickets. Need ${metadataList.length}, have ${tickets.length}`);
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
        console.log('✅ Account info retrieved for batch mint:', accountInfo.result.account_data);
      } catch (accountError) {
        console.error('❌ Failed to get account info:', accountError);
        throw new Error('Account not found or invalid');
      }

      const encoder = new TextEncoder();

      // Créer toutes les transactions NFTokenMint en utilisant map
      const nftTransactionPromises = metadataList.map(async (metadata, index) => {
        const ticket = tickets[index];

        console.log(`🎨 Preparing NFT ${index + 1}/${metadataList.length} with ticket:`, ticket.TicketSequence);

        // Encoder les métadonnées en hex
        const jsonString = JSON.stringify(metadata);
        const uint8Array = encoder.encode(jsonString);
        const uriHex = Array.from(uint8Array)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');

        console.log(`🔗 URI hex generated for NFT ${index + 1}:`, uriHex.substring(0, 50) + '...');
        console.log(`📏 URI length for NFT ${index + 1}:`, uriHex.length, 'characters');

        // Vérifier la taille de l'URI
        if (uriHex.length > 256) {
          console.error(`❌ URI is too long for NFT ${index + 1}:`, uriHex.length, 'characters (max 256)');
          throw new Error(`NFT ${index + 1} metadata is too large. Please use shorter data.`);
        }

        // Créer et retourner la promesse de transaction
        const payload = {
          txjson: {
            TransactionType: 'NFTokenMint' as const,
            Account: address,
            URI: uriHex,
            NFTokenTaxon: taxonBase * 1000 + index, // Utiliser un taxon unique pour chaque NFT
            Flags: 0,
            Sequence: 0, // Utilise le ticket au lieu de sequence
            TicketSequence: ticket.TicketSequence
          }
        };

        return sendTx(payload, sdk);
      });

      console.log('📝 Created batch of NFT mint transaction promises:', nftTransactionPromises.length);

      // Attendre que toutes les transactions se terminent
      const txIds = await Promise.all(nftTransactionPromises);

      console.log('🎉 Batch minting completed successfully!');
      console.log('📊 Transaction IDs:', txIds);

      // Rafraîchir le solde après les transactions
      await refreshBalance();

      // Filtrer les txIds valides et les retourner
      const validTxIds = txIds.filter(txId => txId !== undefined) as string[];

      if (validTxIds.length === 0) {
        throw new Error('All batch NFT mint transactions were rejected');
      }

      return validTxIds;

    } catch (error) {
      console.error('❌ Error in batchMintNFT:', error);
      throw error;
    }
  }, [sdk, address, refreshBalance]);

  /**
   * Creates a batch of NFTokenCreateOffer transactions using pre-created tickets
   * @param offers - Array of offer objects containing nftokenId, amount, destination (optional)
   * @param tickets - Array of tickets to use for the transactions
   * @returns array of transaction hashes
   */
  const batchCreateOffer = useCallback(async (
    offers: Array<{
      nftokenId: string;
      amount: number;
      destination?: string;
      flags?: number;
    }>,
    tickets: Ticket[]
  ): Promise<string[]> => {
    console.log('🏷️ batchCreateOffer called with offers count:', offers.length);
    console.log('🎫 Available tickets:', tickets.length);

    if (!sdk || !address) {
      const error = `Wallet not connected - sdk: ${!!sdk}, address: ${address}`;
      console.error('❌ batchCreateOffer error:', error);
      throw new Error(error);
    }

    if (offers.length === 0) {
      throw new Error('No offers provided');
    }

    if (tickets.length < offers.length) {
      throw new Error(`Not enough tickets. Need ${offers.length}, have ${tickets.length}`);
    }

    try {
      // Vérifier que l'account existe
      if (!clientRef.current) {
        throw new Error('XRPL client not connected');
      }

      try {
        const accountInfo = await clientRef.current.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
        console.log('✅ Account info retrieved for batch create offer:', accountInfo.result.account_data);
      } catch (accountError) {
        console.error('❌ Failed to get account info:', accountError);
        throw new Error('Account not found or invalid');
      }

      // Créer toutes les transactions NFTokenCreateOffer en utilisant map
      const offerTransactionPromises = offers.map(async (offer, index) => {
        const ticket = tickets[index];

        console.log(`🏷️ Preparing offer ${index + 1}/${offers.length} with ticket:`, ticket.TicketSequence);

        // Validation de l'offer
        if (!offer.nftokenId || offer.nftokenId.length !== 64) {
          throw new Error(`Invalid NFTokenID for offer ${index + 1}`);
        }

        if (offer.amount <= 0) {
          throw new Error(`Invalid amount for offer ${index + 1}`);
        }

        // Round amount to 6 decimal places to avoid floating-point precision issues
        const roundedAmount = Math.round(offer.amount * 1000000) / 1000000;

        // Créer le payload de base
        const txjson: any = {
          TransactionType: 'NFTokenCreateOffer' as const,
          Account: address,
          NFTokenID: offer.nftokenId,
          Amount: xrpToDrops(roundedAmount).toString(),
          Sequence: 0, // Utilise le ticket au lieu de sequence
          TicketSequence: ticket.TicketSequence,
          Flags: offer.flags || 0
        };

        // Ajouter la destination si spécifiée (pour sell offer)
        if (offer.destination) {
          txjson.Destination = offer.destination;
        }

        const payload = { txjson };

        console.log(`📝 Offer ${index + 1} payload:`, JSON.stringify(payload, null, 2));

        return sendTx(payload, sdk);
      });

      console.log('📝 Created batch of NFTokenCreateOffer transaction promises:', offerTransactionPromises.length);

      // Attendre que toutes les transactions se terminent
      const txIds = await Promise.all(offerTransactionPromises);

      console.log('🎉 Batch offer creation completed successfully!');
      console.log('📊 Transaction IDs:', txIds);

      // Rafraîchir le solde après les transactions
      await refreshBalance();

      // Filtrer les txIds valides et les retourner
      const validTxIds = txIds.filter(txId => txId !== undefined) as string[];

      if (validTxIds.length === 0) {
        throw new Error('All batch NFTokenCreateOffer transactions were rejected');
      }

      return validTxIds;

    } catch (error) {
      console.error('❌ Error in batchCreateOffer:', error);
      throw error;
    }
  }, [sdk, address, refreshBalance]);

  /**
   * Creates an NFT collection for an event via NFTokenMint transaction
   * @param collectionMetadata - Collection metadata including name, description, eventId, maxSupply, imageUrl
   * @returns transaction hash
   */
  const createNFTCollection = useCallback(async (collectionMetadata: {
    name: string;
    description: string;
    eventId: number;
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
        name: collectionMetadata.name.substring(0, 10), // Nom limité à 10 caractères
        image: imageUrl, // Image URL limitée à 50 caractères
        e: collectionMetadata.eventId, // Event ID
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

      console.log('📝 Creating NFT collection transaction payload...');
      const payload = {
        txjson: {
          TransactionType: 'NFTokenMint' as const,
          Account: address,
          URI: uriHex,
          NFTokenTaxon: collectionMetadata.eventId,
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
   * Creates a complete event setup: collection + tickets + offers
   * @param eventMetadata - Event metadata including name, description, eventId, maxSupply, imageUrl, ticketPrice
   * @returns object with collection txId, ticket NFT IDs, and offer txIds
   */
  const createCompleteEventSetup = useCallback(async (eventMetadata: {
    name: string;
    description: string;
    eventId: number;
    maxSupply: number;
    imageUrl: string;
    ticketPrice: number;
  }) => {
    console.log('🎪 createCompleteEventSetup called with metadata:', eventMetadata);

    if (!sdk || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // 1. Créer la collection NFT pour l'événement
      console.log('📦 Step 1: Creating NFT collection...');
      const collectionTxId = await createNFTCollection({
        name: eventMetadata.name,
        description: eventMetadata.description,
        eventId: eventMetadata.eventId,
        imageUrl: eventMetadata.imageUrl
      });

      console.log('✅ Collection created with txId:', collectionTxId);

      // Attendre que la collection soit confirmée
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 2. Créer les tickets XRPL (20 tickets: 10 pour mint + 10 pour offers)
      const totalTicketsNeeded = eventMetadata.maxSupply * 2;
      console.log(`🎟️ Step 2: Creating ${totalTicketsNeeded} XRPL tickets (${eventMetadata.maxSupply} for minting + ${eventMetadata.maxSupply} for offers)...`);

      const tickets = await createTicket(totalTicketsNeeded);
      console.log('✅ XRPL tickets created:', tickets.length);

      // Diviser les tickets: première moitié pour mint, deuxième moitié pour offers
      const mintTickets = tickets.slice(0, eventMetadata.maxSupply);
      const offerTickets = tickets.slice(eventMetadata.maxSupply);

      console.log('🔄 Mint tickets:', mintTickets.map(t => t.TicketSequence));
      console.log('🏷️ Offer tickets:', offerTickets.map(t => t.TicketSequence));

      // 3. Préparer les métadonnées pour tous les tickets de l'événement
      console.log('📝 Step 3: Preparing metadata for event tickets...');
      const ticketMetadataList = Array.from({ length: eventMetadata.maxSupply }, (_, index) => ({
        name: `Ticket ${index + 1}`,
        image: eventMetadata.imageUrl,
        e: eventMetadata.eventId,
      }));

      // 4. Batch mint tous les tickets NFT
      console.log('🎨 Step 4: Batch minting all event tickets...');
      const mintTxIds = await batchMintNFT(ticketMetadataList, mintTickets, eventMetadata.eventId);
      console.log('✅ Batch minting completed. TxIds:', mintTxIds);

      // Attendre que les NFTs soient confirmés
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 5. Récupérer les NFTokenIDs des tickets créés
      console.log('🔍 Step 5: Retrieving minted NFTokenIDs...');
      const nftObjects = await clientRef.current!.request({
        command: 'account_nfts',
        account: address,
        ledger_index: 'validated'
      });

      // Filtrer les NFTs créés récemment (basé sur les txIds)
      const recentNFTs = nftObjects.result.account_nfts.slice(-eventMetadata.maxSupply);
      const nftTokenIds = recentNFTs.map(nft => nft.NFTokenID);

      console.log('🎫 Retrieved NFTokenIDs:', nftTokenIds);

      if (nftTokenIds.length < eventMetadata.maxSupply) {
        throw new Error(`Expected ${eventMetadata.maxSupply} NFTs, but found ${nftTokenIds.length}`);
      }

      // 6. Préparer les offres de vente pour tous les tickets
      console.log('🏷️ Step 6: Preparing sell offers for all tickets...');
      const offers = nftTokenIds.map(nftTokenId => ({
        nftokenId: nftTokenId,
        amount: eventMetadata.ticketPrice,
        flags: 1 // tfSellNFToken flag pour une sell offer
      }));

      // 7. Batch créer toutes les offres de vente
      console.log('💰 Step 7: Batch creating sell offers...');
      const offerTxIds = await batchCreateOffer(offers, offerTickets);
      console.log('✅ Batch offer creation completed. TxIds:', offerTxIds);

      console.log('🎉 Complete event setup finished successfully!');

      return {
        collectionTxId,
        ticketNFTIds: nftTokenIds,
        offerTxIds
      };

    } catch (error) {
      console.error('❌ Error in createCompleteEventSetup:', error);
      throw error;
    }
  }, [sdk, address, createNFTCollection, createTicket, batchMintNFT, batchCreateOffer]);

  /**
   * Déploie un événement complet via le backend XRPL
   * @param eventMetadata - Métadonnées de l'événement 
   * @returns objet avec les IDs de transaction et le coût total
   */
  const deployEventWithBackend = useCallback(async (eventMetadata: {
    name: string;
    description: string;
    eventId: number;
    maxSupply: number;
    imageUrl: string;
    ticketPrice: number;
  }) => {
    console.log('🎪 deployEventWithBackend called with metadata:', eventMetadata);

    if (!sdk || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // 1. Récupérer l'adresse du backend pour le paiement
      console.log('🏛️ Getting backend payment address...');
      const backendAddressResult = await EventService.getBackendPaymentAddress();
      if (backendAddressResult.errorCode !== ServiceErrorCode.success || !backendAddressResult.result) {
        throw new Error('Failed to get backend payment address');
      }

      const backendAddress = backendAddressResult.result.address;
      console.log('✅ Backend address:', backendAddress);

      // 2. Calculer le coût de déploiement
      console.log('💰 Calculating deployment cost...');
      const costResult = await EventService.getDeploymentCost(eventMetadata.maxSupply);
      if (costResult.errorCode !== ServiceErrorCode.success || !costResult.result) {
        throw new Error('Failed to calculate deployment cost');
      }

      const deploymentCost = costResult.result.cost;
      console.log('✅ Deployment cost:', deploymentCost, 'XRP');

      // 3. Envoyer le paiement au backend
      console.log('💸 Sending payment to backend...');
      const paymentTxId = await sendPayment(backendAddress, deploymentCost);
      console.log('✅ Payment sent, txId:', paymentTxId);

      // 4. Attendre quelques secondes pour que la transaction soit confirmée
      console.log('⏳ Waiting for payment confirmation...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 5. Demander au backend de déployer l'événement
      console.log('🚀 Requesting backend to deploy event...');
      const deploymentResult = await EventService.deployEvent({
        name: eventMetadata.name,
        description: eventMetadata.description,
        eventId: eventMetadata.eventId,
        maxSupply: eventMetadata.maxSupply,
        imageUrl: eventMetadata.imageUrl,
        ticketPrice: eventMetadata.ticketPrice,
        userAddress: address,
        paymentTxId: paymentTxId
      });

      if (deploymentResult.errorCode !== ServiceErrorCode.success || !deploymentResult.result) {
        throw new Error(`Backend deployment failed`);
      }

      console.log('🎉 Event deployed successfully via backend!');
      console.log('📊 Deployment result:', deploymentResult.result);

      return {
        ...deploymentResult.result,
        totalCost: deploymentCost
      };

    } catch (error) {
      console.error('❌ Error in deployEventWithBackend:', error);
      throw error;
    }
  }, [sdk, address, sendPayment]);

  /**
   * Récupère tous les tickets d'un événement en filtrant par taxon
   * @param eventId - ID de l'événement
   * @param backendAddress - Adresse du wallet backend qui a créé les NFTs
   * @returns array d'objets NFT représentant les tickets
   */
  const getEventTickets = useCallback(async (
    eventId: number,
    backendAddress: string
  ): Promise<Array<{
    NFTokenID: string;
    taxon: number;
    ticketIndex: number;
    uri?: string;
    metadata?: any;
  }>> => {
    console.log('🎫 getEventTickets called for event:', eventId, 'from backend:', backendAddress);

    if (!clientRef.current) {
      throw new Error('XRPL client not connected');
    }

    try {
      // Récupérer tous les NFTs du backend
      console.log('🔍 Fetching all NFTs from backend address...');
      const nftResponse = await clientRef.current.request({
        command: 'account_nfts',
        account: backendAddress,
        ledger_index: 'validated'
      });

      const allNFTs = nftResponse.result.account_nfts;
      console.log('📊 Total NFTs found:', allNFTs.length);
      // Calculer la plage de taxons pour cet événement
      const baseTaxon = eventId * 1000;
      const maxTaxon = baseTaxon + 999; // Les tickets vont de eventId*1000 à eventId*1000+999

      console.log('🎯 Filtering NFTs with taxon range:', baseTaxon, 'to', maxTaxon);

      // Filtrer les NFTs qui correspondent à cet événement
      const eventTickets = allNFTs.filter(nft => {
        const taxon = nft.NFTokenTaxon;
        return taxon >= baseTaxon && taxon <= maxTaxon;
      });

      console.log('🎫 Event tickets found:', eventTickets.length);

      // Traiter chaque ticket pour extraire les métadonnées
      const processedTickets = await Promise.all(
        eventTickets.map(async (nft) => {
          const ticketIndex = nft.NFTokenTaxon - baseTaxon;

          let metadata = null;
          if (nft.URI) {
            try {
              // Décoder l'URI hex en JSON
              const hexString = nft.URI;
              const bytes = [];
              for (let i = 0; i < hexString.length; i += 2) {
                bytes.push(parseInt(hexString.substr(i, 2), 16));
              }
              const jsonString = new TextDecoder().decode(new Uint8Array(bytes));
              metadata = JSON.parse(jsonString);
            } catch (error) {
              console.warn('⚠️ Failed to decode metadata for NFT:', nft.NFTokenID, error);
            }
          }

          return {
            NFTokenID: nft.NFTokenID,
            taxon: nft.NFTokenTaxon,
            ticketIndex,
            uri: nft.URI,
            metadata
          };
        })
      );

      // Trier par index de ticket
      processedTickets.sort((a, b) => a.ticketIndex - b.ticketIndex);

      console.log('✅ Processed tickets:', processedTickets.map(t => ({
        id: t.NFTokenID.substring(0, 8) + '...',
        index: t.ticketIndex,
        taxon: t.taxon
      })));

      return processedTickets;

    } catch (error) {
      console.error('❌ Error in getEventTickets:', error);
      throw error;
    }
  }, []);

  /**
  * Trouve le premier ticket NFT qui a une offre de vente active
  * @param eventId - ID de l'événement
  * @param backendAddress - Adresse du wallet backend qui a créé les NFTs
  * @returns l'index de l'offre de vente du premier ticket trouvé, ou null si aucun trouvé
  */
  const findFirstTicketWithSellOffer = useCallback(async (
    eventId: number,
    backendAddress: string
  ): Promise<{ nft_offer_index: string;  NFTokenID: string} | null> => {
    console.log('🔍 findFirstTicketWithSellOffer called for event:', eventId, 'from backend:', backendAddress);

    if (!clientRef.current) {
      throw new Error('XRPL client not connected');
    }

    try {
      // 1. Récupérer tous les tickets de l'événement
      const eventTickets = await getEventTickets(eventId, backendAddress);
      console.log('🎫 Found', eventTickets.length, 'tickets for event', eventId);

      if (eventTickets.length === 0) {
        console.log('⚠️ No tickets found for this event');
        return null;
      }

      // 2. Pour chaque ticket, vérifier s'il a une offre de vente active
      for (const ticket of eventTickets) {
        console.log('🔎 Checking sell offers for NFT:', ticket.NFTokenID);

        try {
          // Récupérer toutes les offres pour ce NFT
          const nftOffersResponse = await clientRef.current.request({
            command: 'nft_sell_offers',
            nft_id: ticket.NFTokenID,
            ledger_index: 'validated'
          });

          const sellOffers = nftOffersResponse.result.offers;
          console.log(`📊 Found ${sellOffers?.length || 0} sell offers for NFT:`, ticket.NFTokenID);

          // Si des offres de vente existent, retourner l'index de la première
          if (sellOffers && sellOffers.length > 0) {
            const firstOffer = sellOffers[0];
            console.log('✅ Found ticket with sell offer!');
            console.log('🎫 NFT:', ticket.NFTokenID);
            console.log('💰 Offer index:', firstOffer.nft_offer_index);

            return { nft_offer_index: firstOffer.nft_offer_index, NFTokenID: ticket.NFTokenID };
          }

        } catch (offerError) {
          // Si aucune offre n'existe pour ce NFT, continuer avec le suivant
          console.log('ℹ️ No sell offers found for NFT:', ticket.NFTokenID);
          continue;
        }
      }

      console.log('⚠️ No tickets with sell offers found for event:', eventId);
      return null;

    } catch (error) {
      console.error('❌ Error in findFirstTicketWithSellOffer:', error);
      throw error;
    }
  }, [getEventTickets]);

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

    // Round amount to 6 decimal places to avoid floating-point precision issues
    const roundedAmount = Math.round(amount * 1000000) / 1000000;

    const unixTime = Math.floor(Date.now() / 1000) + finishAfterSeconds;
    const rippleEpoch = unixTime - 946684800;
    const txId = await sendTx({
      txjson: {
        TransactionType: 'EscrowCreate',
        Account: address,
        Destination: destination,
        Amount: xrpToDrops(roundedAmount).toString(),
        FinishAfter: rippleEpoch
      }
    }, sdk);
    if (txId) {
      await refreshBalance();
      return txId;
    }
    throw new Error('Escrow creation was rejected');
  }, [sdk, address, refreshBalance]);

  /**
   * Achète un NFT en acceptant une offre existante via NFTokenAcceptOffer
   * @param nftOfferIndex - Index de l'offre NFT à accepter
   * @returns transaction hash
   */
  const buyNFT = useCallback(async (nftOfferIndex: string): Promise<string> => {
    if (!sdk || !address) throw new Error('Wallet not connected');

    // Validation de l'index de l'offre
    if (!nftOfferIndex || nftOfferIndex.length !== 64) {
      throw new Error('Invalid NFT offer index (must be 64 characters)');
    }

    console.log('💳 Buying NFT with offer index:', nftOfferIndex);

    try {
      // Vérifier que l'account existe
      if (!clientRef.current) {
        throw new Error('XRPL client not connected');
      }

      try {
        const accountInfo = await clientRef.current.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
        console.log('✅ Account info retrieved for NFT purchase:', accountInfo.result.account_data);
      } catch (accountError) {
        console.error('❌ Failed to get account info:', accountError);
        throw new Error('Account not found or invalid');
      }

      console.log('📝 Creating NFTokenAcceptOffer transaction payload...');
      const payload = {
        txjson: {
          TransactionType: 'NFTokenAcceptOffer' as const,
          Account: address,
          NFTokenSellOffer: nftOfferIndex
        }
      };

      console.log('📋 NFT purchase payload:', JSON.stringify(payload, null, 2));

      const txId = await sendTx(payload, sdk);

      if (txId) {
        console.log('✅ NFT purchase transaction sent, txId:', txId);
        console.log('💰 Refreshing balance after NFT purchase...');
        await refreshBalance();
        return txId;
      }

      throw new Error('NFT purchase transaction was rejected');

    } catch (error) {
      console.error('❌ Error in buyNFT:', error);
      throw error;
    }
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
    createTicket,
    batchMintNFT,
    batchCreateOffer,
    createNFTCollection,
    buyNFT,
    findFirstTicketWithSellOffer,
    createCompleteEventSetup,
    deployEventWithBackend,
    createEscrow
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export default WalletContext;
