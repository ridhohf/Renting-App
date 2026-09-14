import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { uploadImage } from '../middlewares/multer.middleware';
import { Validator } from '../middlewares/validator.middleware';
import { createRoomSchema, updateRoomSchema } from '../validations/room.validation';

export class RoomRouter {
  private router: Router;
  private roomController: RoomController;

  constructor() {
    this.roomController = new RoomController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const tenantAuth = [JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT')];

    this.router.get('/', this.roomController.getRoomsByProperty);
    this.router.get('/:id', this.roomController.getRoomById);

    this.router.post('/', tenantAuth, uploadImage.array('images', 5), Validator.validate(createRoomSchema), this.roomController.createRoom);
    this.router.put('/:id', tenantAuth, Validator.validate(updateRoomSchema), this.roomController.updateRoom);
    this.router.delete('/:id', tenantAuth, this.roomController.deleteRoom);
  }

  getRouter(): Router {
    return this.router;
  }
}
