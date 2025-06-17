import { Ticket } from '../models/ticket.model';
import { Event } from '../models/event.model';
import { Cause } from '../models/cause.model';
import { ServiceResult } from './service.result';

export class TicketService {

    async createTicket(eventId: number, buyerAddress: string, totalAmount: number): Promise<ServiceResult<Ticket>> {
        try {
            const event = await Event.findByPk(eventId);
            if (!event) {
                return ServiceResult.failed();
            }

            if (event.attendees >= event.maxAttendees) {
                return ServiceResult.failed();
            }

            if (totalAmount !== event.ticketPrice) {
                return ServiceResult.failed();
            }

            const ticket = await Ticket.create({
                eventId,
                buyerAddress,
                totalAmount
            });

            await event.update({
                attendees: event.attendees + 1
            });

            const cause = await Cause.findByPk(event.causeId);
            if (cause) {
                await cause.update({
                    raisedAmount: cause.raisedAmount + totalAmount,
                    supporters: cause.supporters + 1
                });
            }

            return ServiceResult.success(ticket);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getTicketsByEvent(eventId: number): Promise<ServiceResult<Ticket[]>> {
        try {
            const tickets = await Ticket.findAll({
                where: { eventId },
                include: [{
                    model: Event,
                    as: 'event'
                }]
            });
            return ServiceResult.success(tickets);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getTicketsByBuyer(buyerAddress: string): Promise<ServiceResult<Ticket[]>> {
        try {
            const tickets = await Ticket.findAll({
                where: { buyerAddress },
                include: [{
                    model: Event,
                    as: 'event'
                }]
            });
            return ServiceResult.success(tickets);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async updateTicketWithNFT(ticketId: number, nftTokenId: string, transactionHash: string): Promise<ServiceResult<Ticket>> {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                return ServiceResult.failed();
            }

            await ticket.update({
                nftTokenId,
                transactionHash
            });

            return ServiceResult.success(ticket);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getEventAvailability(eventId: number): Promise<ServiceResult<{ available: number; total: number; price: number }>> {
        try {
            const event = await Event.findByPk(eventId);
            if (!event) {
                return ServiceResult.failed();
            }

            const available = event.maxAttendees - event.attendees;
            
            return ServiceResult.success({
                available,
                total: event.maxAttendees,
                price: event.ticketPrice
            });
        } catch (error) {
            return ServiceResult.failed();
        }
    }
} 