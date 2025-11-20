import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { firestoreDb } from '../../firebase/firebase-admin.config';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  constructor(
  ) {}

  async findAll() {
    const usersSnapshot = await firestoreDb.collection('appointments').get();
    const appointments = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (!appointments || appointments.length === 0) {
      return [];
    }
    return appointments;
  }

  async create(data: CreateAppointmentDto) {
    try {
      const newAppointmentRef = await firestoreDb
        .collection('appointments')
        .add({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      const newAppointmentSnapshot = await newAppointmentRef.get();

      if (!newAppointmentSnapshot.exists) {
        throw new BadRequestException('Falha ao criar agendamento.');
      }

      // const dateString = new Date(data.date).toISOString().split('T')[0];
      // const fullDate = new Date(`${dateString}T${data.hour}:00`);

      // const email: ISendAppointmentConfirmation = {
      //   patientEmail: data.patientEmail,
      //   patientName: data.patientName,
      //   doctorName: data.specialist,
      //   appointmentDate: fullDate,
      // };

      // await this.resendService.sendAppointmentConfirmationEmail(email);

      return {
        message: 'Agendamento criado com sucesso.',
        id: newAppointmentSnapshot.id,
        ...newAppointmentSnapshot.data(),
      };
    } catch (error) {
      this.logger.error('Erro ao criar agendamento:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar agendamento.');
    }
  }

  async update(id: string, data: UpdateAppointmentDto): Promise<any> {
    try {
      const appointmentRef = firestoreDb.collection('appointments').doc(id);
      const appointmentSnapshot = await appointmentRef.get();

      if (!appointmentSnapshot.exists) {
        throw new BadRequestException('Agendamento não encontrado.');
      }

      await appointmentRef.update({
        ...data,
        updatedAt: new Date().toISOString(),
      });

      const updatedAppointmentSnapshot = await appointmentRef.get();

      return {
        message: 'Agendamento atualizado com sucesso.',
        id: updatedAppointmentSnapshot.id,
        ...updatedAppointmentSnapshot.data(),
      };
    } catch (error) {
      this.logger.error('Erro ao atualizar agendamento:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar agendamento.');
    }
  }

  async delete(id: string) {
    try {
      const appointmentRef = firestoreDb.collection('appointments').doc(id);
      const appointmentSnapshot = await appointmentRef.get();

      if (!appointmentSnapshot.exists) {
        throw new BadRequestException('Agendamento não encontrado.');
      }

      await appointmentRef.delete();
      return 
    } catch (error) {
      this.logger.error('Erro ao deletar agendamento:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao deletar agendamento.');
    }
  }
}
