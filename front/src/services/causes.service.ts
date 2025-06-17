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
        } catch(err) {
            console.log(err);
            return ServiceResult.failed();
        }
    }

    static async getAllCauses(): Promise<ServiceResult<ICauseId[] | undefined>> {
        try {
            const res = await axios.get(`${ApiService.baseURL}/causes`);
            if (res.status === 200) {
                return ServiceResult.success(res.data);
            }
            return ServiceResult.failed();
        } catch(err) {
            console.log(err);
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
        } catch(err) {
            console.log(err)
            return ServiceResult.failed();
        }
    }


}
