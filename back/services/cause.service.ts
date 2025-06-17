import { Cause } from '../models';
import { ServiceResult } from './service.result';
import { Optional } from 'sequelize';

export class CauseService {
    async createCause(data: Optional<Cause, 'id'>): Promise<ServiceResult<Cause>> {
        try {
            const cause = await Cause.create(data);
            return ServiceResult.success(cause);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getAllCauses(): Promise<ServiceResult<Cause[]>> {
        try {
            const causes = await Cause.findAll({
                include: [{
                    model: require('../models/event.model').Event,
                    as: 'events',
                    attributes: []
                }],
                attributes: {
                    include: [
                        [
                            require('sequelize').literal('(SELECT COUNT(*) FROM event WHERE event.causeId = cause.id)'),
                            'eventsCount'
                        ]
                    ]
                }
            });
            
            const causesWithEventCount = causes.map(cause => {
                const causeData = cause.get({ plain: true });
                return {
                    ...causeData,
                    eventsCount: parseInt(causeData.eventsCount) || 0
                };
            });
            
            return ServiceResult.success(causesWithEventCount);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async updateCause(id: number, data: Partial<Cause>): Promise<ServiceResult<Cause>> {
        try {
            const cause = await Cause.findByPk(id);
            if (cause) {
                const updatedCause = await cause.update(data);
                return ServiceResult.success(updatedCause);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
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
            return ServiceResult.failed();
        }
    }

    async getCauseWithEventCount(id: number): Promise<ServiceResult<Cause & { eventsCount: number }>> {
        try {
            const cause = await Cause.findByPk(id, {
                include: [{
                    model: require('../models/event.model').Event,
                    as: 'events',
                    attributes: []
                }],
                attributes: {
                    include: [
                        [
                            require('sequelize').literal('(SELECT COUNT(*) FROM event WHERE event.causeId = cause.id)'),
                            'eventsCount'
                        ]
                    ]
                }
            });
            
            if (cause) {
                const causeData = cause.get({ plain: true });
                return ServiceResult.success({
                    ...causeData,
                    eventsCount: parseInt(causeData.eventsCount) || 0
                });
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            return ServiceResult.failed();
        }
    }
}
