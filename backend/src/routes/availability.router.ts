import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { Validator } from '../middlewares/validator.middleware';
import { createAvailabilitySchema, updateAvailabilitySchema } from '../validations/availability.validation';

export class AvailabilityRouter {
  private router: Router;
  private controller: AvailabilityController;

  constructor() {
    this.controller = new AvailabilityController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT'));
    this.router.get('/', this.controller.getUnavailabilities);
    this.router.post('/', Validator.validate(createAvailabilitySchema), this.controller.createUnavailability);
    this.router.put('/:id', Validator.validate(updateAvailabilitySchema), this.controller.updateUnavailability);
    this.router.delete('/:id', this.controller.deleteUnavailability);
  }

  getRouter(): Router {
    return this.router;
  }
}
