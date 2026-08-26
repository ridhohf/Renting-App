import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service';
import { sendSuccess } from '../utils/response.helper';

export class PropertyController {
  private propertyService = new PropertyService();

  constructor() {
    this.getPublicProperties = this.getPublicProperties.bind(this);
    this.getPropertyBySlug = this.getPropertyBySlug.bind(this);
    this.getTenantProperties = this.getTenantProperties.bind(this);
    this.createProperty = this.createProperty.bind(this);
    this.updateProperty = this.updateProperty.bind(this);
    this.deleteProperty = this.deleteProperty.bind(this);
  }

  async getPublicProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.propertyService.getPublicProperties(req.query);
      sendSuccess(res, 200, { message: 'Properties fetched', data: result.properties, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.propertyService.getPropertyBySlug(req.params.slug as string);
      sendSuccess(res, 200, { message: 'Property fetched', data });
    } catch (error) {
      next(error);
    }
  }

  async getTenantProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.propertyService.getTenantProperties(req.user!.id, req.query);
      sendSuccess(res, 200, { message: 'Properties fetched', data: result.properties, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  async createProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const data = await this.propertyService.createProperty(req.user!.id, req.body, files);
      sendSuccess(res, 201, { message: 'Property created', data });
    } catch (error) {
      next(error);
    }
  }

  async updateProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.propertyService.updateProperty(Number(req.params.id), req.user!.id, req.body);
      sendSuccess(res, 200, { message: 'Property updated', data });
    } catch (error) {
      next(error);
    }
  }

  async deleteProperty(req: Request, res: Response, next: NextFunction) {
    try {
      await this.propertyService.deleteProperty(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Property deleted' });
    } catch (error) {
      next(error);
    }
  }
}
