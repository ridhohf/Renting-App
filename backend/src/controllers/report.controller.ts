import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess } from '../utils/response.helper';
import { AppError } from '../utils/app.error';

export class ReportController {
  private reportService = new ReportService();

  constructor() {
    this.getSalesReport = this.getSalesReport.bind(this);
    this.getPropertyReport = this.getPropertyReport.bind(this);
  }

  async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.reportService.getSalesReport(req.user!.id, req.query as any);
      sendSuccess(res, 200, { message: 'Sales report retrieved', data });
    } catch (error) { next(error); }
  }

  async getPropertyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId, month, year } = req.query;
      if (!propertyId || !month || !year) throw new AppError('propertyId, month, and year are required', 400);
      const data = await this.reportService.getPropertyReport(req.user!.id, Number(propertyId), Number(month), Number(year));
      if (!data) throw new AppError('Property not found or access denied', 404);
      sendSuccess(res, 200, { message: 'Property report retrieved', data });
    } catch (error) { next(error); }
  }
}
