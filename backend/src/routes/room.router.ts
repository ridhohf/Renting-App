import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { uploadImage } from '../middlewares/multer.middleware';

export class RoomRouter {
  private router: Router;
  private roomController: RoomController;

  constructor() {
    this.roomController = new RoomController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.roomController.getRoomsByProperty);
    this.router.get('/:id', this.roomController.getRoomById);
    
    this.router.use(JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT'));
    this.router.post('/', uploadImage.array('images', 5), this.roomController.createRoom);
    this.router.put('/:id', this.roomController.updateRoom);
    this.router.delete('/:id', this.roomController.deleteRoom);
  }

  getRouter(): Router {
    return this.router;
  }
}
