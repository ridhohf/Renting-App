import cron from 'node-cron';
import prisma from '../config/prisma';
import { sendMail } from '../utils/mailer.helper';

export function checkInReminderJob(): void {
  cron.schedule('0 8 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      const orders = await prisma.order.findMany({
        where: {
          status: 'PROCESSED',
          checkInDate: {
            gte: tomorrow,
            lt: nextDay,
          },
        },
        include: { user: true, room: { include: { property: true } } },
      });

      for (const order of orders) {
        if (order.user.email) {
          const subject = `Check-in Reminder for ${order.room.property.name}`;
          const html = `<p>Hi ${order.user.name}, this is a reminder for your check-in tomorrow at ${order.room.property.name}.</p>`;
          await sendMail({ to: order.user.email, subject, html });
        }
      }
      
      if (orders.length > 0) {
        console.log(`Sent ${orders.length} check-in reminders`);
      }
    } catch (error) {
      console.error('Error sending check-in reminders:', error);
    }
  });
}
