import { Router } from 'express';
import { PeakSeasonController } from '../controllers/peak-season.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { Validator } from '../middlewares/validator.middleware';
import { createPeakSeasonSchema, updatePeakSeasonSchema } from '../validations/peak-season.validation';

export class PeakSeasonRouter {
  private router: Router;
  private controller: PeakSeasonController;

  constructor() {
    this.controller = new PeakSeasonController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT'));
    this.router.get('/', this.controller.getPeakSeasons);
    this.router.post('/', Validator.validate(createPeakSeasonSchema), this.controller.createPeakSeason);
    this.router.put('/:id', Validator.validate(updatePeakSeasonSchema), this.controller.updatePeakSeason);
    this.router.delete('/:id', this.controller.deletePeakSeason);
  }

  getRouter(): Router {
    return this.router;
  }
}
