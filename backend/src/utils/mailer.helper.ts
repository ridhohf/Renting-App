import transporter from '../config/nodemailer';
import { ENV } from '../config/env.config';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(options: MailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: ENV.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error: any) {
    console.warn(`[MAILER WARNING] Failed to send email to ${options.to}:`, error?.message || error);
    console.log(`[MAILER FALLBACK PREVIEW] Subject: "${options.subject}"`);
  }
}
