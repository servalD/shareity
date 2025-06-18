import { Event } from '../models';
import { ServiceResult, ServiceErrorCode } from './service.result';
import { Optional } from 'sequelize';
import { XRPLService } from './xrpl.service';

export class EventService {
    private xrplService: XRPLService;

    constructor() {
        this.xrplService = new XRPLService();
    }

    /**
     * Initialise le service XRPL
     */
    async initialize(): Promise<void> {
        await this.xrplService.initialize();
    }

    /**
     * Ferme les connexions
     */
    async shutdown(): Promise<void> {
        await this.xrplService.disconnect();
    }

    /**
     * Retourne l'adresse du backend pour les paiements
     */
    getBackendPaymentAddress(): string {
        return this.xrplService.getBackendAddress();
    }

    /**
     * Calcule le coût de déploiement d'un événement
     */
    calculateEventDeploymentCost(maxSupply: number): number {
        return this.xrplService.calculateDeploymentCost(maxSupply);
    }

    /**
     * Récupère le solde actuel du wallet backend
     */
    async getBackendBalance(): Promise<ServiceResult<number>> {
        return await this.xrplService.getBackendBalance();
    }

    async createEvent(data: Optional<Event, 'id'>): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.create(data);
            return ServiceResult.success(event);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getAllEvents(): Promise<ServiceResult<Event[]>> {
        try {
            const events = await Event.findAll({
                attributes: ['id', 'title', 'description', 'date', 'city', 'country', 'maxAttendees', 'attendees', 'ticketPrice', 'imageUrl', 'causeId'],
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description', 'addressDestination']
                }]
            });
            return ServiceResult.success(events);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getEventById(id: number): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.findByPk(id, {
                attributes: ['id', 'title', 'description', 'date', 'city', 'country', 'maxAttendees', 'attendees', 'ticketPrice', 'imageUrl', 'causeId'],
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description', 'addressDestination']
                }]
            });
            if (event) {
                return ServiceResult.success(event);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async updateEvent(id: number, data: Partial<Event>): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.findByPk(id);
            if (event) {
                const updatedEvent = await event.update(data);
                return ServiceResult.success(updatedEvent);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async deleteEvent(id: number): Promise<ServiceResult<void>> {
        try {
            const event = await Event.findByPk(id);
            if (event) {
                await event.destroy();
                return ServiceResult.success(undefined);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getEventsByCause(causeId: number): Promise<ServiceResult<Event[]>> {
        try {
            const events = await Event.findAll({
                where: { causeId },
                attributes: ['id', 'title', 'description', 'date', 'city', 'country', 'maxAttendees', 'attendees', 'ticketPrice', 'imageUrl', 'causeId'],
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description', 'addressDestination']
                }]
            });
            return ServiceResult.success(events);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getEventsCount(causeId?: number): Promise<ServiceResult<{ causeId?: number; count: number }>> {
        try {
            console.log('🔢 EventService.getEventsCount() called with causeId:', causeId);

            const whereCondition = causeId ? { causeId } : {};
            const count = await Event.count({
                where: whereCondition
            });

            console.log('📊 Events count result:', { causeId, count });

            const result = causeId
                ? { causeId, count }
                : { count };

            return ServiceResult.success(result);
        } catch (error: any) {
            console.error('❌ Error in EventService.getEventsCount():', error);
            return ServiceResult.failed();
        }
    }

    /**
     * Déploie un événement complet sur XRPL après vérification du paiement
     */
    async deployEvent(deploymentData: {
        name: string;
        description: string;
        eventId: number;
        maxSupply: number;
        imageUrl: string;
        ticketPrice: number;
        userAddress: string;
        paymentTxId: string;
    }): Promise<ServiceResult<{
        collectionTxId: string;
        ticketNFTIds: string[];
        offerTxIds: string[];
        totalCost: number;
    }>> {
        try {
            console.log('🎪 EventService.deployEvent called with data:', deploymentData);

            // 1. Calculer et vérifier le coût du déploiement
            const expectedCost = this.calculateEventDeploymentCost(deploymentData.maxSupply);
            console.log('💰 Expected deployment cost:', expectedCost, 'XRP');

            // 2. Vérifier le paiement
            console.log('🔍 Verifying payment...');
            const paymentVerification = await this.xrplService.verifyPayment(
                deploymentData.paymentTxId,
                expectedCost,
                deploymentData.userAddress
            );

            if (paymentVerification.errorCode !== ServiceErrorCode.success || !paymentVerification.result) {
                console.error('❌ Payment verification failed');
                return ServiceResult.failed();
            }

            console.log('✅ Payment verified successfully');

            // 3. Créer la collection NFT
            console.log('📦 Creating NFT collection...');
            const collectionResult = await this.xrplService.createNFTCollection({
                name: deploymentData.name,
                description: deploymentData.description,
                eventId: deploymentData.eventId,
                imageUrl: deploymentData.imageUrl
            });

            if (collectionResult.errorCode !== ServiceErrorCode.success || !collectionResult.result) {
                return ServiceResult.failed();
            }

            const collectionTxId = collectionResult.result;
            console.log('✅ Collection created with txId:', collectionTxId);

            // 4. Créer les tickets XRPL (2x maxSupply: pour mint + offers)
            const totalTicketsNeeded = deploymentData.maxSupply * 2;
            console.log(`🎟️ Creating ${totalTicketsNeeded} XRPL tickets...`);

            const ticketsResult = await this.xrplService.createTickets(totalTicketsNeeded);
            if (ticketsResult.errorCode !== ServiceErrorCode.success || !ticketsResult.result) {
                return ServiceResult.failed();
            }

            const tickets = ticketsResult.result;
            const mintTickets = tickets.slice(0, deploymentData.maxSupply);
            const offerTickets = tickets.slice(deploymentData.maxSupply);

            console.log('✅ Tickets created:', {
                total: tickets.length,
                mint: mintTickets.length,
                offer: offerTickets.length
            });

            // 5. Préparer les métadonnées pour les tickets
            console.log('📝 Preparing ticket metadata...');
            const ticketMetadataList = Array.from({ length: deploymentData.maxSupply }, (_, index) => ({
                name: `${deploymentData.name} #${index + 1}`,
                image: deploymentData.imageUrl,
                e: deploymentData.eventId,
            }));

            // 6. Batch mint des NFTs tickets
            console.log('🎨 Batch minting tickets...');
            const mintResult = await this.xrplService.batchMintNFTs(
                ticketMetadataList,
                mintTickets,
                deploymentData.eventId
            );

            if (mintResult.errorCode !== ServiceErrorCode.success || !mintResult.result) {
                return ServiceResult.failed();
            }

            console.log('✅ Batch minting completed');

            // 7. Récupérer les NFTokenIDs des tickets créés
            console.log('🔍 Retrieving NFTokenIDs...');
            const nftIdsResult = await this.xrplService.getRecentNFTokenIDs(deploymentData.maxSupply);
            if (nftIdsResult.errorCode !== ServiceErrorCode.success || !nftIdsResult.result) {
                return ServiceResult.failed();
            }

            const ticketNFTIds = nftIdsResult.result;
            console.log('✅ Retrieved NFTokenIDs:', ticketNFTIds.length);

            // 8. Créer les offres de vente pour les tickets
            console.log('🏷️ Creating sell offers...');
            const offers = ticketNFTIds.map((nftTokenId: string) => ({
                nftTokenId,
                amount: deploymentData.ticketPrice
            }));

            const offersResult = await this.xrplService.batchCreateOffers(offers, offerTickets);
            if (offersResult.errorCode !== ServiceErrorCode.success || !offersResult.result) {
                return ServiceResult.failed();
            }

            const offerTxIds = offersResult.result;
            console.log('✅ Sell offers created:', offerTxIds.length);

            // 9. Retourner le résultat complet
            const result = {
                collectionTxId,
                ticketNFTIds,
                offerTxIds,
                totalCost: expectedCost
            };

            console.log('🎉 Event deployment completed successfully!', {
                collectionTxId,
                ticketsCreated: ticketNFTIds.length,
                offersCreated: offerTxIds.length,
                totalCost: expectedCost
            });

            return ServiceResult.success(result);

        } catch (error: any) {
            console.error('❌ Error in EventService.deployEvent:', error);
            return ServiceResult.failed();
        }
    }
}
