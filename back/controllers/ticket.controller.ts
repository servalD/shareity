import express, { Request, Response, Router } from 'express';
import { TicketService } from '../services/ticket.service';
import { ServiceErrorCode } from '../services/service.result';

const ticketService = new TicketService();

export class TicketController {

    async createTicket(req: Request, res: Response) {
        try {
            const { eventId, buyerAddress, totalAmount } = req.body;

            if (!eventId || !buyerAddress || totalAmount === undefined) {
                return res.status(400).json({
                    error: 'Missing required fields: eventId, buyerAddress, totalAmount'
                });
            }

            const result = await ticketService.createTicket(eventId, buyerAddress, totalAmount);

            if (result.errorCode === ServiceErrorCode.success && result.result) {
                return res.status(201).json(result.result);
            } else {
                return res.status(400).json({
                    error: 'Failed to create ticket. Event might be full or invalid price.'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    async getTicketsByEvent(req: Request, res: Response) {
        try {
            const { eventId } = req.params;

            if (!eventId) {
                return res.status(400).json({
                    error: 'Event ID is required'
                });
            }

            const result = await ticketService.getTicketsByEvent(parseInt(eventId));

            if (result.errorCode === ServiceErrorCode.success && result.result) {
                return res.status(200).json(result.result);
            } else {
                return res.status(404).json({
                    error: 'No tickets found for this event'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    async getTicketsByBuyer(req: Request, res: Response) {
        try {
            const { buyerAddress } = req.params;

            if (!buyerAddress) {
                return res.status(400).json({
                    error: 'Buyer address is required'
                });
            }

            const result = await ticketService.getTicketsByBuyer(buyerAddress);

            if (result.errorCode === ServiceErrorCode.success && result.result) {
                return res.status(200).json(result.result);
            } else {
                return res.status(404).json({
                    error: 'No tickets found for this buyer'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    async updateTicketWithNFT(req: Request, res: Response) {
        try {
            const { ticketId } = req.params;
            const { nftTokenId, transactionHash } = req.body;

            if (!ticketId || !nftTokenId || !transactionHash) {
                return res.status(400).json({
                    error: 'Missing required fields: nftTokenId, transactionHash'
                });
            }

            const result = await ticketService.updateTicketWithNFT(parseInt(ticketId), nftTokenId, transactionHash);

            if (result.errorCode === ServiceErrorCode.success && result.result) {
                return res.status(200).json(result.result);
            } else {
                return res.status(404).json({
                    error: 'Ticket not found'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    async getEventAvailability(req: Request, res: Response) {
        try {
            const { eventId } = req.params;

            if (!eventId) {
                return res.status(400).json({
                    error: 'Event ID is required'
                });
            }

            const result = await ticketService.getEventAvailability(parseInt(eventId));

            if (result.errorCode === ServiceErrorCode.success && result.result) {
                return res.status(200).json(result.result);
            } else {
                return res.status(404).json({
                    error: 'Event not found'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    buildRoutes(): Router {
        const router = express.Router();
        router.post('/', this.createTicket.bind(this));
        router.get('/event/:eventId', this.getTicketsByEvent.bind(this));
        router.get('/buyer/:buyerAddress', this.getTicketsByBuyer.bind(this));
        router.put('/:ticketId/nft', this.updateTicketWithNFT.bind(this));
        router.get('/availability/:eventId', this.getEventAvailability.bind(this));
        return router;
    }
} 