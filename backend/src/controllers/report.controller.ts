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
      const tenantId = (req as any).user.id;
      const { startDate, endDate, sortBy, sortOrder } = req.query;
      const data = await this.reportService.getSalesReport(tenantId, {
        startDate: startDate as string,
        endDate: endDate as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      });
      sendSuccess(res, 200, { message: 'Sales report retrieved', data });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.id;
      const { propertyId, month, year } = req.query;
      if (!propertyId || !month || !year) {
        throw new AppError('propertyId, month, and year are required', 400);
      }
      const data = await this.reportService.getPropertyReport(
        tenantId,
        Number(propertyId),
        Number(month),
        Number(year)
      );
      if (!data) throw new AppError('Property not found or access denied', 404);
      sendSuccess(res, 200, { message: 'Property report retrieved', data });
    } catch (error) {
      next(error);
    }
  }
}
