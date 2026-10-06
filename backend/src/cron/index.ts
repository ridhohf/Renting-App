import { autoCancelExpiredOrders } from './auto-cancel.cron';
import { checkInReminderJob } from './check-in-reminder.cron';
import { completeFinishedOrdersJob } from './complete-orders.cron';

export function initCronJobs(): void {
  autoCancelExpiredOrders();
  checkInReminderJob();
  completeFinishedOrdersJob();
  console.log('Cron jobs initialized');
}
