import { App } from './app';
import { ENV } from './config/env.config';
import { initCronJobs } from './cron/index';

const app = new App().getApp();

app.listen(ENV.PORT, () => {
  console.log(`Server running on http://localhost:${ENV.PORT}`);
  initCronJobs();
});
