import { autoCancelExpiredOrders } from './auto-cancel.cron';
import { checkInReminderJob } from './check-in-reminder.cron';

export function initCronJobs(): void {
  autoCancelExpiredOrders();
  checkInReminderJob();
  console.log('Cron jobs initialized');
}
