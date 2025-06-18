import { ApiService } from "./api.service";
import { ICause, ICauseId } from "../models/causes.model";
import axios from 'axios';
import { ServiceResult } from "./service.result";

export class CauseService {

    static async createCause(input: ICause): Promise<ServiceResult<ICauseId>> {
        try {
            const res = await axios.post(`${ApiService.baseURL}/causes`, input);
            if (res.status === 201) {
                return ServiceResult.success<ICauseId>(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async getAllCauses(): Promise<ServiceResult<ICauseId[] | undefined>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/causes`, {
                timeout: 10000, // 10 secondes timeout
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            console.error('❌ Error in getAllCauses:', err);
            if (axios.isAxiosError(err)) {
                console.error('🌐 Axios error details:', {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                    url: err.config?.url,
                    timeout: err.code === 'ECONNABORTED' ? 'Request timed out' : false
                });
            }
            return ServiceResult.failed();
        }
    }

    static async updateCause(id: number, updates: Partial<ICause>): Promise<ServiceResult<ICauseId>> {
        try {
            const res = await axios.put(`${ApiService.baseURL}/causes/${id}`, updates);
            if (res.status === 200) {
                return ServiceResult.success<ICauseId>(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async deleteCause(id: number): Promise<ServiceResult<ICauseId>> {
        try {
            const res = await axios.delete(`${ApiService.baseURL}/causes/${id}`);
            if (res.status === 204) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }

    static async getCauseWithEventCount(id: number): Promise<ServiceResult<ICauseId>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/causes/${id}/events-count`);
            if (res.status === 200) {
                return ServiceResult.success<ICauseId>(res.data);
            }
            return ServiceResult.failed();
        } catch (err) {
            return ServiceResult.failed();
        }
    }
}
