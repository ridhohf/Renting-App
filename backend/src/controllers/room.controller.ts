import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app.error';
import { RoomService } from '../services/room.service';
import { sendSuccess } from '../utils/response.helper';

export class RoomController {
  private roomService = new RoomService();

  constructor() {
    this.getRoomsByProperty = this.getRoomsByProperty.bind(this);
    this.getRoomById = this.getRoomById.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.deleteRoom = this.deleteRoom.bind(this);
  }

  async getRoomsByProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.query;
      if (!propertyId) throw new AppError('propertyId is required', 400);
      const data = await this.roomService.getRoomsByProperty(Number(propertyId));
      sendSuccess(res, 200, { message: 'Rooms fetched', data });
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.roomService.getRoomById(Number(req.params.id));
      sendSuccess(res, 200, { message: 'Room fetched', data });
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.id;
      const data = await this.roomService.createRoom(Number(req.body.propertyId), tenantId, req.body, req.files as any[]);
      sendSuccess(res, 201, { message: 'Room created', data });
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.id;
      const data = await this.roomService.updateRoom(Number(req.params.id), tenantId, req.body);
      sendSuccess(res, 200, { message: 'Room updated', data });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.id;
      await this.roomService.deleteRoom(Number(req.params.id), tenantId);
      sendSuccess(res, 200, { message: 'Room deleted', data: null });
    } catch (error) {
      next(error);
    }
  }
}
