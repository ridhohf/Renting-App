import cron from 'node-cron';
import prisma from '../config/prisma';
import { sendMail } from '../utils/mailer.helper';
import { toDateString, toUtcDate } from '../utils/price.helper';

export function checkInReminderJob(): void {
  cron.schedule('0 8 * * *', async () => {
    try {
      const orders = await fetchTomorrowOrders();
      for (const order of orders) await sendOrderReminder(order);
    } catch {
      // Cron errors handled silently in production
    }
  });
}

async function fetchTomorrowOrders() {
  const tomorrow = toUtcDate(new Date(Date.now() + 86400000));
  const nextDay = new Date(tomorrow.getTime() + 86400000);
  return prisma.order.findMany({
    where: { status: 'PROCESSED', checkInDate: { gte: tomorrow, lt: nextDay } },
    include: { user: true, room: { include: { property: true } } },
  });
}

async function sendOrderReminder(order: any): Promise<void> {
  if (!order.user?.email) return;
  const subject = `Check-in Reminder #${order.orderNumber} - ${order.room.property.name}`;
  const html = `<p>Hi ${order.user.name}, reminder for your check-in tomorrow (${toDateString(order.checkInDate)}) at <strong>${order.room.property.name}</strong> (${order.property?.address || order.room.property.address}), Room: ${order.room.name}. Check-in starts at 14:00.</p>`;
  await sendMail({ to: order.user.email, subject, html });
}
