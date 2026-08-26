import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { uploadImage } from '../middlewares/multer.middleware';

export class PropertyRouter {
  private router: Router;
  private propertyController: PropertyController;

  constructor() {
    this.propertyController = new PropertyController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.propertyController.getPublicProperties);
    this.router.get('/:slug', this.propertyController.getPropertyBySlug);
    
    this.router.use('/tenant', JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT'));
    this.router.get('/tenant/list', this.propertyController.getTenantProperties);
    
    const protectedRouter = Router();
    protectedRouter.use(JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT'));
    protectedRouter.post('/', uploadImage.array('images', 5), this.propertyController.createProperty);
    protectedRouter.put('/:id', uploadImage.array('images', 5), this.propertyController.updateProperty);
    protectedRouter.delete('/:id', this.propertyController.deleteProperty);
    
    this.router.use('/', protectedRouter);
  }

  getRouter(): Router {
    return this.router;
  }
}
