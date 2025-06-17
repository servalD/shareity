import { Event } from '../models';
import { ServiceResult } from './service.result';
import { Optional } from 'sequelize';

export class EventService {
    async createEvent(data: Optional<Event, 'id'>): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.create(data);
            return ServiceResult.success(event);
        } catch (error) {
            console.error('Error creating event:', error);
            return ServiceResult.failed();
        }
    }

    async getAllEvents(): Promise<ServiceResult<Event[]>> {
        try {
            const events = await Event.findAll({
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description']
                }]
            });
            return ServiceResult.success(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            return ServiceResult.failed();
        }
    }

    async getEventById(id: number): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.findByPk(id, {
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description']
                }]
            });
            if (event) {
                return ServiceResult.success(event);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            return ServiceResult.failed();
        }
    }

    async updateEvent(id: number, data: Partial<Event>): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.findByPk(id);
            if (event) {
                const updatedEvent = await event.update(data);
                return ServiceResult.success(updatedEvent);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            console.error('Error updating event:', error);
            return ServiceResult.failed();
        }
    }

    async deleteEvent(id: number): Promise<ServiceResult<void>> {
        try {
            const event = await Event.findByPk(id);
            if (event) {
                await event.destroy();
                return ServiceResult.success(undefined);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            return ServiceResult.failed();
        }
    }

    async getEventsByCause(causeId: number): Promise<ServiceResult<Event[]>> {
        try {
            const events = await Event.findAll({
                where: { causeId },
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description']
                }]
            });
            return ServiceResult.success(events);
        } catch (error) {
            console.error('Error fetching events by cause:', error);
            return ServiceResult.failed();
        }
    }
} 