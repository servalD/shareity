import { Cause } from '../models';
import { Event } from '../models/event.model';
import { ServiceResult } from './service.result';
import { Optional } from 'sequelize';
import { literal } from 'sequelize';
import { EventService } from './event.service';

export class CauseService {
    private eventService = new EventService();

    async createCause(data: Optional<Cause, 'id'>): Promise<ServiceResult<Cause>> {
        try {
            const cause = await Cause.create(data);
            return ServiceResult.success(cause);
        } catch (error) {
            return ServiceResult.failed();
        }
    } async getAllCauses(): Promise<ServiceResult<Cause[]>> {
        try {
            // Requête simple sans jointures complexes pour tester
            const causes = await Cause.findAll();

            // Pour l'instant, on met eventsCount à 0 par défaut
            const causesWithEventCount = causes.map(cause => {
                const causeData = cause.get({ plain: true });
                return {
                    ...causeData,
                    eventsCount: 0 // Temporaire, à remplacer par une vraie requête plus tard
                };
            });

            return ServiceResult.success(causesWithEventCount);
        } catch (error: any) {
            console.error('❌ Error in CauseService.getAllCauses():', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            return ServiceResult.failed();
        }
    }

    async getAllCausesWithEventCount(): Promise<ServiceResult<Cause[]>> {
        try {
            // 1. Récupérer toutes les causes
            const causes = await Cause.findAll();

            // 2. Pour chaque cause, récupérer le nombre d'événements
            const causesWithEventCount = await Promise.all(
                causes.map(async (cause) => {
                    const causeData = cause.get({ plain: true });

                    // Utiliser le EventService pour compter les événements
                    const countResult = await this.eventService.getEventsCount(causeData.id);
                    let eventsCount = 0;

                    if (countResult.errorCode === 0 && countResult.result) { // 0 = success
                        eventsCount = countResult.result.count;
                    }

                    return {
                        ...causeData,
                        eventsCount
                    };
                })
            );

            return ServiceResult.success(causesWithEventCount);
        } catch (error: any) {
            console.error('❌ Error in CauseService.getAllCausesWithEventCount():', error);
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
