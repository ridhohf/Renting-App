import { autoCancelExpiredOrders } from './auto-cancel.cron';
import { autoCompleteOrders } from './auto-complete.cron';
import { checkInReminderJob } from './check-in-reminder.cron';

export function initCronJobs(): void {
  autoCancelExpiredOrders();
  autoCompleteOrders();
  checkInReminderJob();
  console.log('Cron jobs initialized');
}
