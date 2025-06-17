import express, { Request, Response, Router } from 'express';
import { EventService } from '../services';
import { ServiceResult, ServiceErrorCode } from '../services/service.result';
import { Event } from '../models';

const eventService = new EventService();

export class EventController {

    async createEvent(req: Request, res: Response) {
        try {
            const serviceResult: ServiceResult<Event> = await eventService.createEvent(req.body);
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(201).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error creating event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error creating event' });
        }
    }

    async getAllEvents(req: Request, res: Response) {
        try {
            const serviceResult: ServiceResult<Event[]> = await eventService.getAllEvents();
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error fetching events' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching events' });
        }
    }

    async getEventById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<Event> = await eventService.getEventById(Number(id));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Event not found' });
            } else {
                return res.status(500).json({ message: 'Error fetching event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching event' });
        }
    }

    async updateEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<Event> = await eventService.updateEvent(Number(id), req.body);
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Event not found' });
            } else {
                return res.status(500).json({ message: 'Error updating event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error updating event' });
        }
    }

    async deleteEvent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<void> = await eventService.deleteEvent(Number(id));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(204).send();
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Event not found' });
            } else {
                return res.status(500).json({ message: 'Error deleting event' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error deleting event' });
        }
    }

    async getEventsByCause(req: Request, res: Response) {
        try {
            const { causeId } = req.params;
            const serviceResult: ServiceResult<Event[]> = await eventService.getEventsByCause(Number(causeId));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error fetching events by cause' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching events by cause' });
        }
    }

    buildRoutes(): Router {
        const router = express.Router();
        router.get('/', this.getAllEvents.bind(this));
        router.get('/:id', this.getEventById.bind(this));
        router.post('/', this.createEvent.bind(this));
        router.put('/:id', this.updateEvent.bind(this));
        router.delete('/:id', this.deleteEvent.bind(this));
        router.get('/cause/:causeId', this.getEventsByCause.bind(this));
        return router;
    }
} 