import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { appointmentTemplate } from './templates/appointment.template';
import { ISendAppointmentConfirmation } from 'src/models/appointment-template.model';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resendInstance: Resend;
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    if (!this.apiKey) {
        throw new Error('RESEND_API_KEY não está definido.');
    }

    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || '';
    if (!this.fromEmail) {
        throw new Error('RESEND_FROM_EMAIL não está definido.');
    }

    this.resendInstance = new Resend(this.apiKey);
  }

  async sendAppointmentConfirmationEmail(dto: ISendAppointmentConfirmation) {
    const { patientEmail, patientName, doctorName, appointmentDate } = dto;

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(appointmentDate)

    const templateData = {
        patientName,
        doctorName,
        formattedDate,
    };

    const subject = 'Confirmação de Consulta Médica';
    const html = appointmentTemplate(templateData);

    try {
        const { data, error } = await this.resendInstance.emails.send({
            from: this.fromEmail,
            to: [patientEmail],
            subject,
            html,
        });

        if (error) {
            throw new Error(`Erro Resend: ${error.message}`);
        }

        this.logger.log(`Confirmação enviada para ${patientEmail}, ID: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Erro inesperado para ${patientEmail}`, error);
      throw error;
    }

  }

}