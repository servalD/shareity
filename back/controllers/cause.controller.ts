import express, { Request, Response, Router } from 'express';
import { CauseService } from '../services';
import { ServiceResult, ServiceErrorCode } from '../services/service.result';
import { Cause } from '../models';

const causeService = new CauseService();

export class CauseController {

    async createCause(req: Request, res: Response) {
        try {
            const serviceResult: ServiceResult<Cause> = await causeService.createCause(req.body);
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(201).json(serviceResult.result);
            } else {
                return res.status(400).json({ message: 'Error creating cause', errorCode: serviceResult.errorCode });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error creating cause' });
        }
    }

    async getAllCauses(req: Request, res: Response) {
        try {
            // Utiliser la nouvelle méthode avec le vrai compte d'événements
            const serviceResult: ServiceResult<Cause[]> = await causeService.getAllCausesWithEventCount();
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else {
                return res.status(500).json({ message: 'Error fetching causes', errorCode: serviceResult.errorCode });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching causes' });
        }
    }

    async updateCause(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<Cause> = await causeService.updateCause(Number(id), req.body);
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Cause not found' });
            } else {
                return res.status(400).json({ message: 'Error updating cause', errorCode: serviceResult.errorCode });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error updating cause' });
        }
    }

    async deleteCause(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<void> = await causeService.deleteCause(Number(id));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(204).send();
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Cause not found' });
            } else {
                return res.status(400).json({ message: 'Error deleting cause', errorCode: serviceResult.errorCode });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error deleting cause' });
        }
    }

    async getCauseWithEventCount(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const serviceResult: ServiceResult<Cause & { eventsCount: number }> = await causeService.getCauseWithEventCount(Number(id));
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            } else if (serviceResult.errorCode === ServiceErrorCode.notFound) {
                return res.status(404).json({ message: 'Cause not found' });
            } else {
                return res.status(400).json({ message: 'Error fetching cause with event count', errorCode: serviceResult.errorCode });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching cause with event count' });
        }
    }

    buildRoutes(): Router {
        const router = express.Router();
        router.get('/', this.getAllCauses.bind(this));
        router.get('/:id/events-count', this.getCauseWithEventCount.bind(this));
        router.post('/', this.createCause.bind(this));
        router.put('/:id', this.updateCause.bind(this));
        router.delete('/:id', this.deleteCause.bind(this));
        return router;
    }
}
