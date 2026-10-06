import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { ENV } from '../config/env.config';
import { uploadImage } from '../middlewares/multer.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { Validator } from '../middlewares/validator.middleware';
import { updateProfileSchema, changePasswordSchema, changeEmailSchema } from '../validations/user.validation';

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const authMiddleware = JwtVerify.verifyToken(ENV.JWT_SECRET);
    const roleMiddleware = RoleGuard.allow('USER', 'TENANT');
    
    this.router.use(authMiddleware, roleMiddleware);
    
    this.router.get('/profile', this.userController.getProfile);
    this.router.patch('/profile', Validator.validate(updateProfileSchema), this.userController.updateProfile);
    this.router.patch('/avatar', uploadImage.single('avatar'), this.userController.updateAvatar);
    this.router.patch('/password', Validator.validate(changePasswordSchema), this.userController.changePassword);
    this.router.patch('/email', Validator.validate(changeEmailSchema), this.userController.changeEmail);
  }

  getRouter(): Router {
    return this.router;
  }
}
