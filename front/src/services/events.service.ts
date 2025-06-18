import { ApiService } from "./api.service";
import { IEvent, IEventId, IEventWithCause, IEventWithCauseId } from "../models/events.model";
import axios from 'axios';
import { ServiceResult } from "./service.result";

export class EventService {

    static async createEvent(input: IEvent): Promise<ServiceResult<IEventWithCauseId>> {
        try {
            const res = await axios.post(`${ApiService.baseURL}/events`, input);
            if (res.status === 201) {
                return ServiceResult.success<IEventWithCauseId>(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async getAllEvents(): Promise<ServiceResult<IEventWithCauseId[] | undefined>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/events`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async getEventById(id: number): Promise<ServiceResult<IEventWithCauseId | undefined>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/events/${id}`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async updateEvent(id: number, updates: Partial<IEvent>): Promise<ServiceResult<IEventWithCauseId>> {
        try {
            const res = await axios.put(`${ApiService.baseURL}/events/${id}`, updates);
            if (res.status === 200) {
                return ServiceResult.success<IEventWithCauseId>(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async deleteEvent(id: number): Promise<ServiceResult<void>> {
        try {
            const res = await axios.delete(`${ApiService.baseURL}/events/${id}`);
            if (res.status === 204) {
                return ServiceResult.success(undefined);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async getEventsByCause(causeId: number): Promise<ServiceResult<IEventWithCauseId[] | undefined>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/events/cause/${causeId}`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async getEventsCount(causeId?: number): Promise<ServiceResult<{ causeId?: number; count: number } | undefined>> {
        try {
            const url = causeId
                ? `${ApiService.baseURL}/events/count/${causeId}`
                : `${ApiService.baseURL}/events/count`;
            const res = await axios.get(url);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    /**
     * Récupère l'adresse du backend pour les paiements
     */
    static async getBackendPaymentAddress(): Promise<ServiceResult<{ address: string }>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/events/backend-address`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed<{ address: string }>();
        } catch (err: any) {
            return ServiceResult.failed<{ address: string }>();
        }
    }

    /**
     * Calcule le coût de déploiement d'un événement
     */
    static async getDeploymentCost(maxSupply: number): Promise<ServiceResult<{
        maxSupply: number;
        cost: number;
        currency: string
    }>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/events/deployment-cost?maxSupply=${maxSupply}`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed<{ maxSupply: number; cost: number; currency: string }>();
        } catch (err: any) {
            return ServiceResult.failed<{ maxSupply: number; cost: number; currency: string }>();
        }
    }

    /**
     * Récupère le solde actuel du wallet backend
     */
    static async getBackendBalance(): Promise<ServiceResult<{
        balance: number;
        currency: string;
        address: string;
    }>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/events/backend-balance`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed<{ balance: number; currency: string; address: string }>();
        } catch (err: any) {
            return ServiceResult.failed<{ balance: number; currency: string; address: string }>();
        }
    }

    /**
     * Déploie un événement complet sur XRPL
     */
    static async deployEvent(deploymentData: {
        name: string;
        description: string;
        eventId: number;
        maxSupply: number;
        imageUrl?: string;
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
            const res = await axios.post(`${ApiService.baseURL}/events/deploy`, deploymentData);
            if (res.status === 200) {
                return ServiceResult.success(res.data.data);
            }
            return ServiceResult.failed<{
                collectionTxId: string;
                ticketNFTIds: string[];
                offerTxIds: string[];
                totalCost: number;
            }>();
        } catch (err: any) {
            return ServiceResult.failed<{
                collectionTxId: string;
                ticketNFTIds: string[];
                offerTxIds: string[];
                totalCost: number;
            }>();
        }
    }
}
