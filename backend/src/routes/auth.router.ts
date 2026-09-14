import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { Validator } from '../middlewares/validator.middleware';
import {
  registerSchema, verifySchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
  resendVerificationSchema, googleLoginSchema,
} from '../validations/auth.validation';

export class AuthRouter {
  private router = Router();
  private authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', Validator.validate(registerSchema), this.authController.register);
    this.router.post('/verify', Validator.validate(verifySchema), this.authController.verifyEmail);
    this.router.post('/login', Validator.validate(loginSchema), this.authController.login);
    this.router.post('/forgot-password', Validator.validate(forgotPasswordSchema), this.authController.forgotPassword);
    this.router.post('/reset-password', Validator.validate(resetPasswordSchema), this.authController.resetPassword);
    this.router.post('/resend-verification', Validator.validate(resendVerificationSchema), this.authController.resendVerification);
    this.router.post('/google', Validator.validate(googleLoginSchema), this.authController.googleLogin);
  }

  getRouter(): Router {
    return this.router;
  }
}
