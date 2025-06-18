import { Client, xrpToDrops, dropsToXrp, Transaction, Wallet } from 'xrpl';
import { ServiceResult, ServiceErrorCode } from './service.result';

interface EventDeploymentData {
  name: string;
  description: string;
  eventId: number;
  maxSupply: number;
  imageUrl: string;
  ticketPrice: number;
  userAddress: string;
  paymentTxId: string;
}

interface DeploymentResult {
  collectionTxId: string;
  ticketNFTIds: string[];
  offerTxIds: string[];
  totalCost: number;
}

export class XRPLService {
  private client: Client;
  private wallet: Wallet;
  private network: 'testnet' | 'mainnet';

  constructor() {
    this.network = process.env.XRPL_NETWORK as 'testnet' | 'mainnet' || 'testnet';

    // Initialiser le wallet du backend à partir des variables d'environnement
    const backendSeed = process.env.XRPL_BACKEND_SEED;
    if (!backendSeed) {
      throw new Error('XRPL_BACKEND_SEED environment variable is required');
    }

    this.wallet = Wallet.fromSeed(backendSeed);

    // Configurer le client XRPL
    const wsUrl = this.network === 'mainnet'
      ? 'wss://s1.ripple.com'
      : 'wss://s.altnet.rippletest.net';

    this.client = new Client(wsUrl);
  }

  /**
   * Initialise la connexion au réseau XRPL
   */
  async initialize(): Promise<void> {
    try {
      console.log('🌐 Connecting to XRPL network:', this.network);
      await this.client.connect();
      console.log('✅ XRPL client connected');
      console.log('🏛️ Backend wallet address:', this.wallet.address);
    } catch (error) {
      console.error('❌ Failed to connect to XRPL:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion au réseau XRPL
   */
  async disconnect(): Promise<void> {
    if (this.client.isConnected()) {
      await this.client.disconnect();
      console.log('🔌 XRPL client disconnected');
    }
  }

  /**
   * Retourne l'adresse du wallet backend pour les paiements
   */
  getBackendAddress(): string {
    return this.wallet.address;
  }

  /**
   * Récupère le solde actuel du wallet backend
   */
  async getBackendBalance(): Promise<ServiceResult<number>> {
    try {
      console.log('💰 Fetching backend wallet balance for:', this.wallet.address);

      const response = await this.client.request({
        command: 'account_info',
        account: this.wallet.address,
        ledger_index: 'validated'
      });

      const balance = Number(response.result.account_data.Balance) / 1_000_000; // Convert drops to XRP
      console.log('✅ Backend wallet balance:', balance, 'XRP');

      return ServiceResult.success(balance);
    } catch (error: any) {
      console.error('❌ Error fetching backend balance:', error);

      // Si l'account n'existe pas, le solde est 0
      if (error?.data?.error_code === 19) { // Account not found
        console.log('⚠️ Backend wallet account not found - needs funding');
        return ServiceResult.success(0);
      }

      return ServiceResult.failed<number>();
    }
  }

  /**
   * Vérifie qu'un paiement a été reçu et qu'il correspond au montant attendu
   */
  async verifyPayment(txId: string, expectedAmount: number, fromAddress: string): Promise<ServiceResult<boolean>> {
    try {
      console.log('🔍 Verifying payment:', { txId, expectedAmount, fromAddress });

      // Récupérer la transaction
      const txResponse = await this.client.request({
        command: 'tx',
        transaction: txId
      });

      const tx = txResponse.result.tx_json;
      const meta = txResponse.result.meta;

      // Vérifier que c'est un paiement
      if (tx.TransactionType !== 'Payment') {
        console.log('❌ Transaction is not a payment');
        return ServiceResult.failed<boolean>();
      }

      // Vérifier l'adresse source
      if (tx.Account !== fromAddress) {
        console.log('❌ Payment source address does not match');
        return ServiceResult.failed<boolean>();
      }

      // Vérifier l'adresse de destination
      if (tx.Destination !== this.wallet.address) {
        console.log('❌ Payment destination does not match backend address');
        return ServiceResult.failed<boolean>();
      }

      // Debug: Log the full transaction structure
      console.log('🔍 Full transaction response:', JSON.stringify(txResponse.result, null, 2));
      console.log('🔍 Transaction details:', {
        TransactionType: tx.TransactionType,
        Account: tx.Account,
        Destination: tx.Destination,
        Amount: tx.Amount,
        AmountType: typeof tx.Amount
      });

      // Vérifier le montant - try multiple fields where amount can be stored
      let amountInDrops: string | undefined;

      // Try different fields where the amount might be stored
      if (tx.Amount && typeof tx.Amount === 'string') {
        amountInDrops = tx.Amount;
        console.log('🔍 Found amount in tx.Amount:', amountInDrops);
      } else if ((tx as any).DeliverMax && typeof (tx as any).DeliverMax === 'string') {
        amountInDrops = (tx as any).DeliverMax;
        console.log('🔍 Found amount in tx.DeliverMax:', amountInDrops);
      } else if (meta && (meta as any).delivered_amount) {
        amountInDrops = (meta as any).delivered_amount;
        console.log('🔍 Found amount in meta.delivered_amount:', amountInDrops);
      }

      if (!amountInDrops) {
        console.log('❌ No payment amount found in transaction');
        return ServiceResult.failed<boolean>();
      }

      let paidAmount: number;

      // Handle amount conversion
      if (typeof amountInDrops === 'string') {
        // Simple XRP payment (amount in drops)
        paidAmount = Number(dropsToXrp(amountInDrops));
        console.log('🔍 Converted amount from drops:', amountInDrops, 'to XRP:', paidAmount);
      } else {
        console.log('❌ Invalid payment amount format');
        return ServiceResult.failed<boolean>();
      }

      console.log(`💰 Payment verification: Expected ${expectedAmount} XRP, Received ${paidAmount} XRP`);

      if (paidAmount < expectedAmount) {
        console.log(`❌ Insufficient payment amount. Expected: ${expectedAmount}, Received: ${paidAmount}`);
        return ServiceResult.failed<boolean>();
      }

      // Vérifier que la transaction est validée
      if (meta && typeof meta === 'object' && 'TransactionResult' in meta && meta.TransactionResult !== 'tesSUCCESS') {
        console.log('❌ Transaction failed');
        return ServiceResult.failed<boolean>();
      }

      console.log('✅ Payment verified successfully');
      return ServiceResult.success(true);

    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      return ServiceResult.failed<boolean>();
    }
  }

  /**
   * Crée une collection NFT pour un événement
   */
  async createNFTCollection(eventMetadata: {
    name: string;
    description: string;
    eventId: number;
    imageUrl: string;
  }): Promise<ServiceResult<string>> {
    try {
      console.log('🎨 Creating NFT collection:', eventMetadata);

      // Optimiser les métadonnées pour réduire la taille
      const collectionData = {
        name: eventMetadata.name.substring(0, 20),
        image: eventMetadata.imageUrl,
        e: eventMetadata.eventId,
      };

      const jsonString = JSON.stringify(collectionData);
      const uriHex = Buffer.from(jsonString, 'utf8').toString('hex').toUpperCase();

      console.log('📏 URI length:', uriHex.length, 'characters');

      if (uriHex.length > 512) {
        console.log('❌ NFT metadata is too large');
        return ServiceResult.failed<string>();
      }

      // Préparer la transaction
      const tx: Transaction = {
        TransactionType: 'NFTokenMint',
        Account: this.wallet.address,
        URI: uriHex,
        NFTokenTaxon: eventMetadata.eventId,
        Flags: 0
      };

      // Soumettre et attendre la validation
      const result = await this.client.submitAndWait(tx, { wallet: this.wallet });

      // Vérifier le succès de la transaction
      const meta = result.result.meta;
      if (meta && typeof meta === 'object' && 'TransactionResult' in meta && meta.TransactionResult === 'tesSUCCESS') {
        console.log('✅ Collection created successfully, txId:', result.result.hash);
        return ServiceResult.success(result.result.hash);
      } else {
        console.log('❌ Collection creation failed');
        return ServiceResult.failed<string>();
      }

    } catch (error) {
      console.error('❌ Error creating NFT collection:', error);
      return ServiceResult.failed<string>();
    }
  }

  /**
   * Crée des tickets XRPL pour les opérations en lot
   */
  async createTickets(count: number): Promise<ServiceResult<number[]>> {
    try {
      console.log(`🎫 Creating ${count} XRPL tickets...`);

      const tx: Transaction = {
        TransactionType: 'TicketCreate',
        Account: this.wallet.address,
        TicketCount: count
      };

      const result = await this.client.submitAndWait(tx, { wallet: this.wallet });

      // Vérifier le succès de la transaction
      const meta = result.result.meta;
      if (meta && typeof meta === 'object' && 'TransactionResult' in meta && meta.TransactionResult === 'tesSUCCESS') {

        // Récupérer les tickets créés
        const ticketsResponse = await this.client.request({
          command: 'account_objects',
          account: this.wallet.address,
          type: 'ticket',
          ledger_index: 'validated'
        });

        const tickets = ticketsResponse.result.account_objects as any[];
        const ticketSequences = tickets
          .map(ticket => ticket.TicketSequence)
          .sort((a, b) => b - a) // Plus récents en premier
          .slice(0, count);

        console.log('✅ Tickets created:', ticketSequences);
        return ServiceResult.success(ticketSequences);
      } else {
        console.log('❌ Ticket creation failed');
        return ServiceResult.failed<number[]>();
      }

    } catch (error) {
      console.error('❌ Error creating tickets:', error);
      return ServiceResult.failed<number[]>();
    }
  }

  /**
   * Mint plusieurs NFTs en lot avec des tickets
   */
  async batchMintNFTs(
    metadataList: Array<{ name: string; image: string; e: number }>,
    tickets: number[],
    taxonBase: number
  ): Promise<ServiceResult<string[]>> {
    try {
      console.log('🎨 Batch minting NFTs:', metadataList.length);

      const txPromises = metadataList.map(async (metadata, index) => {
        const ticket = tickets[index];

        const jsonString = JSON.stringify(metadata);
        const uriHex = Buffer.from(jsonString, 'utf8').toString('hex').toUpperCase();

        const tx: Transaction = {
          TransactionType: 'NFTokenMint',
          Account: this.wallet.address,
          URI: uriHex,
          NFTokenTaxon: taxonBase * 1000 + index,
          Flags: 0,
          Sequence: 0,
          TicketSequence: ticket
        };

        return this.client.submitAndWait(tx, { wallet: this.wallet });
      });

      const results = await Promise.all(txPromises);
      const txIds: string[] = [];

      for (const result of results) {
        const meta = result.result.meta;
        if (meta && typeof meta === 'object' && 'TransactionResult' in meta && meta.TransactionResult === 'tesSUCCESS') {
          txIds.push(result.result.hash);
        }
      }

      console.log('✅ Batch minting completed:', txIds.length, 'NFTs');
      return ServiceResult.success(txIds);

    } catch (error) {
      console.error('❌ Error in batch minting:', error);
      return ServiceResult.failed<string[]>();
    }
  }

  /**
   * Récupère les NFTokenIDs des NFTs créés récemment
   */
  async getRecentNFTokenIDs(count: number): Promise<ServiceResult<string[]>> {
    try {
      console.log('🔍 Retrieving recent NFTokenIDs...');

      const nftResponse = await this.client.request({
        command: 'account_nfts',
        account: this.wallet.address,
        ledger_index: 'validated'
      });

      const recentNFTs = nftResponse.result.account_nfts.slice(-count);
      const nftTokenIds = recentNFTs.map((nft: any) => nft.NFTokenID);

      console.log('✅ Retrieved NFTokenIDs:', nftTokenIds);
      return ServiceResult.success(nftTokenIds);

    } catch (error) {
      console.error('❌ Error retrieving NFTokenIDs:', error);
      return ServiceResult.failed<string[]>();
    }
  }

  /**
   * Crée des offres de vente en lot pour des NFTs
   */
  async batchCreateOffers(
    offers: Array<{ nftTokenId: string; amount: number }>,
    tickets: number[]
  ): Promise<ServiceResult<string[]>> {
    try {
      console.log('🏷️ Batch creating offers:', offers.length);

      const txPromises = offers.map(async (offer, index) => {
        const ticket = tickets[index];

        // Round amount to 6 decimal places to avoid floating-point precision issues
        const roundedAmount = Math.round(offer.amount * 1000000) / 1000000;

        const tx: Transaction = {
          TransactionType: 'NFTokenCreateOffer',
          Account: this.wallet.address,
          NFTokenID: offer.nftTokenId,
          Amount: xrpToDrops(roundedAmount).toString(),
          Flags: 1, // tfSellNFToken
          Sequence: 0,
          TicketSequence: ticket
        };

        return this.client.submitAndWait(tx, { wallet: this.wallet });
      });

      const results = await Promise.all(txPromises);
      const txIds: string[] = [];

      for (const result of results) {
        const meta = result.result.meta;
        if (meta && typeof meta === 'object' && 'TransactionResult' in meta && meta.TransactionResult === 'tesSUCCESS') {
          txIds.push(result.result.hash);
        }
      }

      console.log('✅ Batch offer creation completed:', txIds.length, 'offers');
      return ServiceResult.success(txIds);

    } catch (error) {
      console.error('❌ Error in batch offer creation:', error);
      return ServiceResult.failed<string[]>();
    }
  }

  /**
   * Calcule le coût total du déploiement d'un événement
   */
  calculateDeploymentCost(maxSupply: number): number {
    // Coût approximatif: 
    // - 1 NFT collection: ~0.01 XRP
    // - Création de tickets: ~0.01 XRP
    // - Mint NFTs: maxSupply * 0.01 XRP
    // - Création d'offres: maxSupply * 0.01 XRP
    const baseCost = 0.02; // Collection + tickets
    const nftCost = maxSupply * 0.01; // Mint
    const offerCost = maxSupply * 0.01; // Offers

    // Round to 6 decimal places to avoid floating-point precision issues
    const totalCost = baseCost + nftCost + offerCost;
    return Math.round(totalCost * 1000000) / 1000000;
  }
}
