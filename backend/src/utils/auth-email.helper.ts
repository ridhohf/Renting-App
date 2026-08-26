export class AuthEmailHelper {
  static buildVerificationEmail(name: string, verifyUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome ${name}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link: ${verifyUrl}</p>
      </div>
    `;
  }

  static buildResetPasswordEmail(name: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Reset Your Password, ${name}</h2>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `;
  }
}
