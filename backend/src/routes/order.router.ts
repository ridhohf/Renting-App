import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { uploadPaymentProof } from '../middlewares/multer.middleware';
import { Validator } from '../middlewares/validator.middleware';
import { createOrderSchema } from '../validations/order.validation';

export class OrderRouter {
  private router = Router();
  private controller = new OrderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const verifyToken = JwtVerify.verifyToken(ENV.JWT_SECRET);
    this.setupUserRoutes(verifyToken);
    this.setupTenantRoutes(verifyToken);
  }

  private setupUserRoutes(auth: any): void {
    const guard = RoleGuard.allow('USER');
    const idParam = Validator.validateIdParam();
    this.router.post('/', auth, guard, Validator.validate(createOrderSchema), this.controller.createOrder);
    this.router.get('/user', auth, guard, this.controller.getUserOrders);
    this.router.get('/user/:id', auth, guard, idParam, this.controller.getOrderById);
    this.router.patch('/:id/payment-proof', auth, guard, idParam, uploadPaymentProof.single('paymentProof'), this.controller.uploadPaymentProof);
    this.router.post('/:id/payment-gateway', auth, guard, idParam, this.controller.processPaymentGateway);
    this.router.patch('/:id/cancel', auth, guard, idParam, this.controller.cancelOrder);
  }

  private setupTenantRoutes(auth: any): void {
    const guard = RoleGuard.allow('TENANT');
    const idParam = Validator.validateIdParam();
    this.router.get('/tenant', auth, guard, this.controller.getTenantOrders);
    this.router.get('/tenant/:id', auth, guard, idParam, this.controller.getTenantOrderById);
    this.router.patch('/:id/confirm', auth, guard, idParam, this.controller.confirmPayment);
    this.router.patch('/:id/reject', auth, guard, idParam, this.controller.rejectPayment);
    this.router.patch('/:id/tenant-cancel', auth, guard, idParam, this.controller.cancelOrderByTenant);
  }

  getRouter(): Router {
    return this.router;
  }
}
