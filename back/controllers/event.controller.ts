import express, { Request, Response, Router } from 'express';
import { EventService } from '../services';
import { ServiceResult, ServiceErrorCode } from '../services/service.result';
import { Event } from '../models';

const eventService = new EventService();

// Initialiser le service XRPL au démarrage
eventService.initialize().catch(console.error);

export class EventController {

    async createEvent(req: Request, res: Response) {
        try {
            const serviceResult: ServiceResult<Event> = await eventService.createEvent(req.body);
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(201).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error creating event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error creating event' });
        }
    }

    async getAllEvents(req: Request, res: Response) {
        try {
            const serviceResult: ServiceResult<Event[]> = await eventService.getAllEvents();
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error fetching events' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching events' });
        }
    }

    async getEventById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<Event> = await eventService.getEventById(Number(id));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Event not found' });
            } else {
                return res.status(500).json({ message: 'Error fetching event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching event' });
        }
    }

    async updateEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<Event> = await eventService.updateEvent(Number(id), req.body);
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Event not found' });
            } else {
                return res.status(500).json({ message: 'Error updating event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error updating event' });
        }
    }

    async deleteEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<void> = await eventService.deleteEvent(Number(id));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(204).send();
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Event not found' });
            } else {
                return res.status(500).json({ message: 'Error deleting event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error deleting event' });
        }
    }

    async getEventsByCause(req: Request, res: Response) {
        try {
            const { causeId } = req.params;
            const serviceResult: ServiceResult<Event[]> = await eventService.getEventsByCause(Number(causeId));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error fetching events by cause' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching events by cause' });
        }
    }

    async getEventsCount(req: Request, res: Response) {
        try {
            const serviceResult: ServiceResult<{ count: number }> = await eventService.getEventsCount();
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error fetching events count', errorCode: serviceResult.errorCode });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching events count' });
        }
    }

    async getEventsCountByCause(req: Request, res: Response) {
        try {
            const { causeId } = req.params;
            const serviceResult: ServiceResult<{ causeId?: number; count: number }> = await eventService.getEventsCount(Number(causeId));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error fetching events count by cause', errorCode: serviceResult.errorCode });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching events count by cause' });
        }
    }

    /**
     * Retourne l'adresse du backend pour les paiements
     */
    async getBackendPaymentAddress(req: Request, res: Response) {
        try {
            const address = eventService.getBackendPaymentAddress();
            return res.status(200).json({ address });
        } catch (err) {
            return res.status(500).json({ message: 'Error getting backend payment address' });
        }
    }

    /**
     * Retourne le solde actuel du wallet backend
     */
    async getBackendBalance(req: Request, res: Response) {
        try {
            const result = await eventService.getBackendBalance();
            if (result.errorCode === ServiceErrorCode.success) {
                return res.status(200).json({
                    balance: result.result,
                    currency: 'XRP',
                    address: eventService.getBackendPaymentAddress()
                });
            } else {
                return res.status(500).json({ message: 'Error fetching backend balance' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching backend balance' });
        }
    }

    /**
     * Calcule le coût de déploiement d'un événement
     */
    async getDeploymentCost(req: Request, res: Response) {
        try {
            const { maxSupply } = req.query;
            if (!maxSupply || isNaN(Number(maxSupply))) {
                return res.status(400).json({ message: 'Invalid maxSupply parameter' });
            }

            const cost = eventService.calculateEventDeploymentCost(Number(maxSupply));
            return res.status(200).json({
                maxSupply: Number(maxSupply),
                cost,
                currency: 'XRP'
            });
        } catch (err) {
            return res.status(500).json({ message: 'Error calculating deployment cost' });
        }
    }

    /**
     * Déploie un événement complet sur XRPL
     */
    async deployEvent(req: Request, res: Response) {
        try {
            const {
                name,
                description,
                eventId,
                maxSupply,
                imageUrl,
                ticketPrice,
                userAddress,
                paymentTxId
            } = req.body;

            // Validation des paramètres
            if (!name || !description || !eventId || !maxSupply || !ticketPrice || !userAddress || !paymentTxId) {
                return res.status(400).json({
                    message: 'Missing required parameters',
                    required: ['name', 'description', 'eventId', 'maxSupply', 'ticketPrice', 'userAddress', 'paymentTxId']
                });
            }

            if (maxSupply < 1 || maxSupply > 1000) {
                return res.status(400).json({ message: 'maxSupply must be between 1 and 1000' });
            }

            if (ticketPrice <= 0) {
                return res.status(400).json({ message: 'ticketPrice must be greater than 0' });
            }

            console.log('🚀 Starting event deployment for:', name);

            const deploymentResult = await eventService.deployEvent({
                name,
                description,
                eventId: Number(eventId),
                maxSupply: Number(maxSupply),
                imageUrl: imageUrl || 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Event',
                ticketPrice: Number(ticketPrice),
                userAddress,
                paymentTxId
            });

            if (deploymentResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json({
                    message: 'Event deployed successfully',
                    data: deploymentResult.result
                });
            } else {
                return res.status(400).json({
                    message: 'Event deployment failed'
                });
            }

        } catch (err: any) {
            console.error('❌ Error in deployEvent controller:', err);
            return res.status(500).json({
                message: 'Error deploying event',
                error: err.message
            });
        }
    }

    buildRoutes(): Router {
        const router = express.Router();
        router.get('/', this.getAllEvents.bind(this));
        router.get('/count', this.getEventsCount.bind(this)); // Route générale pour compter tous les événements
        router.get('/count/:causeId', this.getEventsCountByCause.bind(this)); // Route pour compter par cause
        router.get('/cause/:causeId', this.getEventsByCause.bind(this));
        router.get('/backend-address', this.getBackendPaymentAddress.bind(this)); // Adresse pour les paiements
        router.get('/backend-balance', this.getBackendBalance.bind(this)); // Solde du wallet backend
        router.get('/deployment-cost', this.getDeploymentCost.bind(this)); // Calcul du coût de déploiement
        router.get('/:id', this.getEventById.bind(this));
        router.post('/', this.createEvent.bind(this));
        router.post('/deploy', this.deployEvent.bind(this)); // Déploiement d'événement sur XRPL
        router.put('/:id', this.updateEvent.bind(this));
        router.delete('/:id', this.deleteEvent.bind(this));
        return router;
    }
}
