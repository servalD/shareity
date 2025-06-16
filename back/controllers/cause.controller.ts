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
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error creating cause' });
        }
    }

    async getAllCauses(req: Request, res: Response) {
        try {
            const serviceResult: ServiceResult<Cause[]> = await causeService.getAllCauses();
            if (serviceResult.errorCode === ServiceErrorCode.success) {
                return res.status(200).json(serviceResult.result);
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error fetching causes' });
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
            }
        } catch (err) {
            return res.status(500).json({ message: 'Error deleting cause' });
        }
    }

    buildRoutes(): Router {
        const router = express.Router();
        router.get('/', this.getAllCauses.bind(this));
        router.post('/', this.createCause.bind(this));
        router.delete('/:id', this.deleteCause.bind(this));
        return router;
    }
}
