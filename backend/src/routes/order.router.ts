import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { uploadImage } from '../middlewares/multer.middleware';

export class OrderRouter {
  private router: Router;
  private controller: OrderController;

  constructor() {
    this.controller = new OrderController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const verifyToken = JwtVerify.verifyToken(ENV.JWT_SECRET);
    
    // USER routes
    this.router.post('/', verifyToken, RoleGuard.allow('USER'), this.controller.createOrder);
    this.router.get('/user', verifyToken, RoleGuard.allow('USER'), this.controller.getUserOrders);
    this.router.get('/user/:id', verifyToken, RoleGuard.allow('USER'), this.controller.getOrderById);
    this.router.patch('/:id/payment-proof', verifyToken, RoleGuard.allow('USER'), uploadImage.single('paymentProof'), this.controller.uploadPaymentProof);
    this.router.patch('/:id/cancel', verifyToken, RoleGuard.allow('USER'), this.controller.cancelOrder);
    
    // TENANT routes
    this.router.get('/tenant', verifyToken, RoleGuard.allow('TENANT'), this.controller.getTenantOrders);
    this.router.patch('/:id/confirm', verifyToken, RoleGuard.allow('TENANT'), this.controller.confirmPayment);
    this.router.patch('/:id/reject', verifyToken, RoleGuard.allow('TENANT'), this.controller.rejectPayment);
    this.router.patch('/:id/tenant-cancel', verifyToken, RoleGuard.allow('TENANT'), this.controller.cancelOrderByTenant);
  }

  getRouter(): Router {
    return this.router;
  }
}
