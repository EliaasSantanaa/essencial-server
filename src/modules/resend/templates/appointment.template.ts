interface AppointmentTemplateData {
  patientName: string;
  doctorName: string;
  formattedDate: string;
}

export const appointmentTemplate = (data: AppointmentTemplateData): string => {
  const { patientName, doctorName, formattedDate } = data;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      
      <div style="background-color: #333333; padding: 25px; text-align: center;">
        <img src="https://logo-clinica-essencialdev.s3.sa-east-1.amazonaws.com/logo-cor.png" alt="Logo da Clinica EssencialDev" style="max-width: 200px; height: auto;">
      </div>
      
      <div style="padding: 30px;">
      
        <h2 style="color: #333;">Olá, ${patientName}!</h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Seu agendamento na <strong>Clinica EssencialDev</strong> foi confirmado com sucesso.
        </p>

        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Confira abaixo os detalhes da sua consulta:
        </p>

        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 25px 0;">
          <p style="margin: 10px 0; font-size: 18px; color: #333;">
            <strong>Especialista:</strong><br> ${doctorName}
          </p>
          <p style="margin: 10px 0; font-size: 18px; color: #333;">
            <strong>Data e Hora:</strong><br> ${formattedDate}
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.5; color: #555; margin-top: 20px;">
          Caso precise reagendar ou cancelar, por favor acesse o portal com antecedência.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://essencial-dev.vercel.app/sign-in" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
            Acessar Portal
          </a>
        </div>

        <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
          Atenciosamente,<br>
          Equipe EssencialDev
        </p>
        
      </div>
      
    </div>
  `;
};