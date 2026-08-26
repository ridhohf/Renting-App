import { Request, Response, NextFunction } from 'express';
import { AvailabilityService } from '../services/availability.service';
import { sendSuccess } from '../utils/response.helper';

export class AvailabilityController {
  private availabilityService = new AvailabilityService();

  constructor() {
    this.getUnavailabilities = this.getUnavailabilities.bind(this);
    this.createUnavailability = this.createUnavailability.bind(this);
    this.updateUnavailability = this.updateUnavailability.bind(this);
    this.deleteUnavailability = this.deleteUnavailability.bind(this);
  }

  async getUnavailabilities(req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = Number(req.query.roomId);
      const data = await this.availabilityService.getUnavailabilities(roomId, req.user!.id);
      sendSuccess(res, 200, { message: 'Unavailabilities fetched', data });
    } catch (error) {
      next(error);
    }
  }

  async createUnavailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId, ...body } = req.body;
      const data = await this.availabilityService.createUnavailability(Number(roomId), req.user!.id, body);
      sendSuccess(res, 201, { message: 'Unavailability created', data });
    } catch (error) {
      next(error);
    }
  }

  async updateUnavailability(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.availabilityService.updateUnavailability(Number(req.params.id), req.user!.id, req.body);
      sendSuccess(res, 200, { message: 'Unavailability updated', data });
    } catch (error) {
      next(error);
    }
  }

  async deleteUnavailability(req: Request, res: Response, next: NextFunction) {
    try {
      await this.availabilityService.deleteUnavailability(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Unavailability deleted' });
    } catch (error) {
      next(error);
    }
  }
}
