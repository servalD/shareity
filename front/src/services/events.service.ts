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
        } catch(err) {
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
        } catch(err) {
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
        } catch(err) {
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
        } catch(err) {
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
        } catch(err) {
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
        } catch(err) {
            return ServiceResult.failed();
        }
    }
} 