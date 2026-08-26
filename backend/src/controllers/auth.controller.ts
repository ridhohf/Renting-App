import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app.error';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.helper';

export class AuthController {
  private authService = new AuthService();

  constructor() {
    this.register = this.register.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.login = this.login.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.resendVerification = this.resendVerification.bind(this);
    this.googleLogin = this.googleLogin.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, role } = req.body;
      const user = await this.authService.register({ email, name, role });
      sendSuccess(res, 201, { message: 'Registration successful', data: user });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await this.authService.verifyAndSetPassword(token, password);
      sendSuccess(res, 200, { message: 'Email verified and password set successfully' });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await this.authService.login(email, password);
      sendSuccess(res, 200, { message: 'Login successful', data });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const data = await this.authService.forgotPassword(email);
      sendSuccess(res, 200, { message: data.message });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      sendSuccess(res, 200, { message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const data = await this.authService.resendVerification(email);
      sendSuccess(res, 200, { message: data.message });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const data = await this.authService.googleLogin(token);
      sendSuccess(res, 200, { message: 'Google login successful', data });
    } catch (error) {
      next(error);
    }
  }
}
