import { ApiService } from "./api.service";
import { ITicket, ITicketId, ITicketWithEvent, ITicketWithEventId, IEventAvailability } from "../models/tickets.model";
import axios from 'axios';
import { ServiceResult } from "./service.result";

export class TicketService {

    static async createTicket(eventId: number, buyerAddress: string, totalAmount: number): Promise<ServiceResult<ITicketId>> {
        try {
            const res = await axios.post(`${ApiService.baseURL}/tickets`, {
                eventId,
                buyerAddress,
                totalAmount
            });
            if (res.status === 201) {
                return ServiceResult.success<ITicketId>(res.data);
            }
            return ServiceResult.failed();
        } catch(err) {
            return ServiceResult.failed();
        }
    }

    static async getTicketsByEvent(eventId: number): Promise<ServiceResult<ITicketWithEventId[]>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/tickets/event/${eventId}`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch(err) {
            return ServiceResult.failed();
        }
    }

    static async getTicketsByBuyer(buyerAddress: string): Promise<ServiceResult<ITicketWithEventId[]>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/tickets/buyer/${buyerAddress}`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch(err) {
            return ServiceResult.failed();
        }
    }

    static async updateTicketWithNFT(ticketId: number, nftTokenId: string, transactionHash: string): Promise<ServiceResult<ITicketId>> {
        try {
            const res = await axios.put(`${ApiService.baseURL}/tickets/${ticketId}/nft`, {
                nftTokenId,
                transactionHash
            });
            if (res.status === 200) {
                return ServiceResult.success<ITicketId>(res.data);
            }
            return ServiceResult.failed();
        } catch(err) {
            return ServiceResult.failed();
        }
    }

    static async getEventAvailability(eventId: number): Promise<ServiceResult<IEventAvailability>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/tickets/availability/${eventId}`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch(err) {
            return ServiceResult.failed();
        }
    }
} 