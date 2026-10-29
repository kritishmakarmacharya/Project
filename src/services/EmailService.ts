import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { smtpConfig } from "../config/appConfig";

export default class EmailService {
  private transport: Transporter;

  constructor() {
    try {
      const transportConfig: SMTPTransport.Options = {
        host: smtpConfig.host as string,
        port: Number(smtpConfig.port),
        service: smtpConfig.service as string,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.password,
        },
      };
      this.transport = nodemailer.createTransport(transportConfig);
    } catch (exception) {
      console.error("SMTP Server Connection Failed", exception);
      throw { code: 500, message: "SMTP Server Not Connected..." };
    }
  }

  async sendEmail({
    to,
    subject,
    message,
  }: {
    to: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      await this.transport.sendMail({
        from: smtpConfig.fromAddress,
        to: to,
        subject: subject,
        html: message,
      });
    } catch (exception) {
      console.error("Email sendong failed", exception);
      throw { code: 500, message: "Email Sending Failed..." };
    }
  }
}
