import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEnv } from 'src/config/env.config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const env = this.configService.get<IEnv>('env');
    const emailConfig = env?.SMTP_EMAIL_CONFIG;

    if (
      emailConfig?.EMAIL_HOST &&
      emailConfig?.EMAIL_USER &&
      emailConfig?.EMAIL_PASSWORD
    ) {
      try {
        this.transporter = nodemailer.createTransport({
          host: emailConfig.EMAIL_HOST,
          port: Number(emailConfig.EMAIL_PORT) || 587,
          secure: Number(emailConfig.EMAIL_PORT) === 465,
          auth: {
            user: emailConfig.EMAIL_USER,
            pass: emailConfig.EMAIL_PASSWORD,
          },
        });
        this.logger.log('Mail transporter initialized successfully');
      } catch (error) {
        const err = error as Error;
        this.logger.warn(
          `Failed to initialize mail transporter: ${err.message}`,
        );
      }
    } else {
      this.logger.warn(
        'SMTP credentials not fully provided; fallback logger will log emails to console',
      );
    }
  }

  async sendVerificationOtpEmail(
    to: string,
    otp: string,
    name?: string,
  ): Promise<void> {
    const env = this.configService.get<IEnv>('env');
    const appName = env?.APPLICATION.APP_NAME || 'Elevetor Service';

    const subject = `Verify your account - ${appName}`;
    const displayName = name || 'User';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Welcome to ${appName}!</h2>
        <p>Hello <strong>${displayName}</strong>,</p>
        <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background: #f4f6f8; border-radius: 6px; color: #111;">
            ${otp}
          </span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you did not create this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    `;

    await this.sendMail(to, subject, html, `Your OTP is: ${otp}`);
  }

  async sendPasswordResetOtpEmail(
    to: string,
    otp: string,
    name?: string,
  ): Promise<void> {
    const env = this.configService.get<IEnv>('env');
    const appName = env?.APPLICATION.APP_NAME || 'Elevetor Service';
    const displayName = name || 'User';
    const subject = `Password Reset Request - ${appName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Hello <strong>${displayName}</strong>,</p>
        <p>We received a request to reset your password. Use the following OTP to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background: #fff1f0; border-radius: 6px; color: #cf1322;">
            ${otp}
          </span>
        </div>
        <p style="color: #666; font-size: 14px;">This code is valid for 10 minutes. If you did not request a password reset, please secure your account immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    `;

    await this.sendMail(
      to,
      subject,
      html,
      `Your Password Reset OTP is: ${otp}`,
    );
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    textFallback: string,
  ): Promise<void> {
    const env = this.configService.get<IEnv>('env');
    const fromName =
      env?.SMTP_EMAIL_CONFIG.EMAIL_FROM_NAME || 'Elevetor Service';
    const fromEmail =
      env?.SMTP_EMAIL_CONFIG.EMAIL_FROM || 'no-reply@example.com';

    // Log the OTP in console for local dev convenience
    this.logger.log(
      `[DEV EMAIL DISPATCH] To: ${to} | Subject: ${subject} | Details: ${textFallback}`,
    );

    if (!this.transporter) {
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text: textFallback,
        html,
      });
      this.logger.log(`Email successfully dispatched to ${to}`);
    } catch (error) {
      const err = error as Error;
      this.logger.warn(
        `Failed to send email to ${to}: ${err.message}. (Fallback logged in console above)`,
      );
    }
  }
}
