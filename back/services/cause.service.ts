import { Cause } from '../models';
import { ServiceResult } from './service.result';
import { Optional } from 'sequelize';

export class CauseService {
    async createCause(data: Optional<Cause, 'id'>): Promise<ServiceResult<Cause>> {
        try {
            const cause = await Cause.create(data);
            return ServiceResult.success(cause);
        } catch (error) {
            console.error('Error creating cause:', error);
            return ServiceResult.failed();
        }
    }

    async getAllCauses(): Promise<ServiceResult<Cause[]>> {
        try {
            const causes = await Cause.findAll();
            return ServiceResult.success(causes);
        } catch (error) {
            console.error('Error fetching causes:', error);
            return ServiceResult.failed();
        }
    }

    async deleteCause(id: number): Promise<ServiceResult<void>> {
        try {
            const cause = await Cause.findByPk(id);
            if (cause) {
                const deletedCause = await cause.destroy();
                return ServiceResult.success(deletedCause);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            console.error('Error deleting cause:', error);
            return ServiceResult.failed();
        }
    }
}
