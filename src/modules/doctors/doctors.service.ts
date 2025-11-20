import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { firestoreDb } from '../../firebase/firebase-admin.config';

@Injectable()
export class DoctorsService {
  constructor() {}
  async create(dto: CreateDoctorDto) {
    const doctorsCollection = firestoreDb.collection('doctors');
    const doctorRef = await doctorsCollection.add({ ...dto });
    const doctorSnapshot = await doctorRef.get();
    return { id: doctorSnapshot.id, ...doctorSnapshot.data() };
  }

  async findAll() {
    const doctorsSnapshot = await firestoreDb.collection('doctors').get();
    const doctors = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return doctors;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctorRef = firestoreDb.collection('doctors').doc(id);
    await doctorRef.update({ ...updateDoctorDto });
    const updatedDoctor = await doctorRef.get();
    return { id: updatedDoctor.id, ...updatedDoctor.data() };
  }

  async remove(id: string) {
    const doctorRef = firestoreDb.collection('doctors').doc(id);
    const doctor = await doctorRef.get();

    if (!doctor.exists) {
      throw new NotFoundException('Doutor não encontrado');
    }
    await doctorRef.delete();
  }
}
