import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { sendSuccess } from '../utils/response.helper';

export class OrderController {
  private orderService = new OrderService();

  constructor() {
    this.createOrder = this.createOrder.bind(this);
    this.getUserOrders = this.getUserOrders.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.uploadPaymentProof = this.uploadPaymentProof.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    this.getTenantOrders = this.getTenantOrders.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.rejectPayment = this.rejectPayment.bind(this);
    this.cancelOrderByTenant = this.cancelOrderByTenant.bind(this);
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.orderService.createOrder(req.user!.id, req.body);
      sendSuccess(res, 201, { message: 'Order created', data });
    } catch (error) { next(error); }
  }

  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.orderService.getUserOrders(req.user!.id, req.query);
      sendSuccess(res, 200, { message: 'Orders fetched', data: result.orders, meta: result.meta });
    } catch (error) { next(error); }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.orderService.getOrderById(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Order fetched', data });
    } catch (error) { next(error); }
  }

  async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.orderService.uploadPaymentProof(Number(req.params.id), req.user!.id, req.file!.path);
      sendSuccess(res, 200, { message: 'Payment proof uploaded', data });
    } catch (error) { next(error); }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.orderService.cancelOrder(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Order cancelled', data });
    } catch (error) { next(error); }
  }

  async getTenantOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.orderService.getTenantOrders(req.user!.id, req.query);
      sendSuccess(res, 200, { message: 'Orders fetched', data: result.orders, meta: result.meta });
    } catch (error) { next(error); }
  }

  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.orderService.confirmPayment(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Payment confirmed', data });
    } catch (error) { next(error); }
  }

  async rejectPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.orderService.rejectPayment(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Payment rejected', data });
    } catch (error) { next(error); }
  }

  async cancelOrderByTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.orderService.cancelOrderByTenant(Number(req.params.id), req.user!.id);
      sendSuccess(res, 200, { message: 'Order cancelled by tenant', data });
    } catch (error) { next(error); }
  }
}
