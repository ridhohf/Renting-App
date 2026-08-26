import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export class AuthRouter {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.authController.register);
    this.router.post('/verify', this.authController.verifyEmail);
    this.router.post('/login', this.authController.login);
    this.router.post('/forgot-password', this.authController.forgotPassword);
    this.router.post('/reset-password', this.authController.resetPassword);
    this.router.post('/resend-verification', this.authController.resendVerification);
    this.router.post('/google', this.authController.googleLogin);
  }

  getRouter(): Router {
    return this.router;
  }
}
