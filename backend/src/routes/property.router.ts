import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { uploadImage } from '../middlewares/multer.middleware';
import { Validator } from '../middlewares/validator.middleware';
import { createPropertySchema, updatePropertySchema } from '../validations/property.validation';

export class PropertyRouter {
  private router: Router;
  private propertyController: PropertyController;

  constructor() {
    this.propertyController = new PropertyController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const tenantAuth = [JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT')];

    this.router.get('/', this.propertyController.getPublicProperties);
    this.router.get('/cities', this.propertyController.getCities);
    this.router.get('/tenant/list', tenantAuth, this.propertyController.getTenantProperties);
    this.router.get('/:slug/calendar', this.propertyController.getPropertyCalendar);
    this.router.get('/:slug', this.propertyController.getPropertyBySlug);

    this.router.post('/', tenantAuth, uploadImage.array('images', 5), Validator.validate(createPropertySchema), this.propertyController.createProperty);
    this.router.put('/:id', tenantAuth, uploadImage.array('images', 5), Validator.validate(updatePropertySchema), this.propertyController.updateProperty);
    this.router.delete('/:id', tenantAuth, this.propertyController.deleteProperty);
  }

  getRouter(): Router {
    return this.router;
  }
}
