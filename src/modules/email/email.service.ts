import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private sgMail: MailService;
  constructor(private readonly configService: ConfigService) {
    this.sgMail = new MailService();
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      this.sgMail.setApiKey(apiKey);
    } else {
      console.error('SENDGRID_API_KEY not found in environment variables.');
    }
  }

  async sendCustomVerificationEmail(to: string, link: string) {
    const msg = {
      to: to,
      from: 'clinicaessencialdev@gmail.com',
      subject:
        'Verifique seu e-mail para ativar sua conta na Clínica EssencialDev',
      html: this.createVerificationEmailTemplate(link),
    };

    try {
       await this.sgMail.send(msg); 
      console.log(`E-mail de verificação enviado para ${to}`);
    } catch (error) {
      console.error('Erro ao enviar e-mail pelo SendGrid', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error('Não foi possível enviar o e-mail de verificação.');
    }
  }

  private createVerificationEmailTemplate(link: string): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Bem-vindo à Clínica EssencialDev!</h2>
        <p>Sua conta foi criada, mas precisa ser ativada. Por favor, clique no botão abaixo para verificar seu e-mail e ativar sua conta.</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
          Ativar Minha Conta
        </a>
        <p>Se você não criou esta conta, por favor, ignore este e-mail.</p>
        <p>Obrigado,<br>Equipe Clínica EssencialDev</p>
      </div>
    `;
  }
}
