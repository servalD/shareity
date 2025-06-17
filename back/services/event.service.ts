import { Event } from '../models';
import { ServiceResult } from './service.result';
import { Optional } from 'sequelize';

export class EventService {
    async createEvent(data: Optional<Event, 'id'>): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.create(data);
            return ServiceResult.success(event);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getAllEvents(): Promise<ServiceResult<Event[]>> {
        try {
            const events = await Event.findAll({
                attributes: ['id', 'title', 'description', 'date', 'city', 'country', 'maxAttendees', 'attendees', 'ticketPrice', 'imageUrl', 'causeId'],
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description', 'addressDestination']
                }]
            });
            return ServiceResult.success(events);
        } catch (error) {
            return ServiceResult.failed();
        }
    }

    async getEventById(id: number): Promise<ServiceResult<Event>> {
        try {
            const event = await Event.findByPk(id, {
                attributes: ['id', 'title', 'description', 'date', 'city', 'country', 'maxAttendees', 'attendees', 'ticketPrice', 'imageUrl', 'causeId'],
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description', 'addressDestination']
                }]
            });
            if (event) {
                return ServiceResult.success(event);
            } else {
                return ServiceResult.notFound();
            }
        } catch (error) {
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
            return ServiceResult.failed();
        }
    }

    async getEventsByCause(causeId: number): Promise<ServiceResult<Event[]>> {
        try {
            const events = await Event.findAll({
                where: { causeId },
                attributes: ['id', 'title', 'description', 'date', 'city', 'country', 'maxAttendees', 'attendees', 'ticketPrice', 'imageUrl', 'causeId'],
                include: [{
                    model: require('../models/cause.model').Cause,
                    as: 'cause',
                    attributes: ['id', 'title', 'description', 'addressDestination']
                }]
            });
            return ServiceResult.success(events);
        } catch (error) {
            return ServiceResult.failed();
        }
    }
} 