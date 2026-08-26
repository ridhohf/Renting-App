import cron from 'node-cron';
import prisma from '../config/prisma';

export function autoCancelExpiredOrders(): void {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const expiredOrders = await prisma.order.findMany({
        where: {
          status: 'WAITING_PAYMENT',
          expiresAt: { lt: now },
        },
      });

      if (expiredOrders.length > 0) {
        const orderIds = expiredOrders.map((o) => o.id);
        const result = await prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: {
            status: 'CANCELLED',
            cancelledBy: 'SYSTEM',
            cancelReason: 'Payment deadline expired',
          },
        });
        
        console.log(`Cancelled ${result.count} expired orders`);
      }
    } catch (error) {
      console.error('Error auto-cancelling orders:', error);
    }
  });
}
