export interface ISendAppointmentConfirmation {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
}