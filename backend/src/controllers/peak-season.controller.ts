import { Request, Response, NextFunction } from 'express';
import { PeakSeasonService } from '../services/peak-season.service';
import { sendSuccess } from '../utils/response.helper';

export class PeakSeasonController {
  private peakSeasonService = new PeakSeasonService();

  constructor() {
    this.getPeakSeasons = this.getPeakSeasons.bind(this);
    this.createPeakSeason = this.createPeakSeason.bind(this);
    this.updatePeakSeason = this.updatePeakSeason.bind(this);
    this.deletePeakSeason = this.deletePeakSeason.bind(this);
  }

  async getPeakSeasons(req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = Number(req.query.roomId);
      const data = await this.peakSeasonService.getPeakSeasons(roomId, req.user!.id);
      sendSuccess(res, 200, { message: 'Peak seasons fetched', data });
    } catch (error) {
      next(error);
    }
  }

  async createPeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId, ...body } = req.body;
      const data = await this.peakSeasonService.createPeakSeason(Number(roomId), req.user!.id, body);
      sendSuccess(res, 201, { message: 'Peak season created', data });
    } catch (error) {
      next(error);
    }
  }

  async updatePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.peakSeasonService.updatePeakSeason(Number(req.params.id), req.user!.id, req.body);
      sendSuccess(res, 200, { message: 'Peak season updated', data });
    } catch (error) {
      next(error);
    }
  }

  async deletePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      await this.peakSeasonService.deletePeakSeason(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Peak season deleted' });
    } catch (error) {
      next(error);
    }
  }
}
