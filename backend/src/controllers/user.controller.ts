import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app.error';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response.helper';

export class UserController {
  private userService = new UserService();

  constructor() {
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateAvatar = this.updateAvatar.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.changeEmail = this.changeEmail.bind(this);
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await this.userService.getProfile(userId);
      sendSuccess(res, 200, { message: 'Profile retrieved', data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await this.userService.updateProfile(userId, req.body);
      sendSuccess(res, 200, { message: 'Profile updated', data });
    } catch (error) {
      next(error);
    }
  }

  async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      if (!req.file) throw new AppError('No file uploaded', 400);
      const data = await this.userService.updateAvatar(userId, req.file.path);
      sendSuccess(res, 200, { message: 'Avatar updated', data });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { oldPassword, newPassword } = req.body;
      const data = await this.userService.changePassword(userId, oldPassword, newPassword);
      sendSuccess(res, 200, { message: data.message });
    } catch (error) {
      next(error);
    }
  }

  async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { email } = req.body;
      const data = await this.userService.changeEmail(userId, email);
      sendSuccess(res, 200, { message: data.message });
    } catch (error) {
      next(error);
    }
  }
}
