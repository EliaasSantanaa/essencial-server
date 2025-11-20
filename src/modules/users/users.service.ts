import { BadRequestException, Injectable } from '@nestjs/common';
import { firestoreDb } from '../../firebase/firebase-admin.config';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor() {}

  async findAll() {
    const usersSnapshot = await firestoreDb.collection('users').get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.createTime?.toDate().toLocaleDateString(),
    }));
    return users;
  }

  async findOne(id: string) {
    const userDoc = await firestoreDb.collection('users').doc(id).get();
    if (!userDoc.exists) {
      throw new BadRequestException('Usuário não encontrado');
    }
    return {
      id: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.createTime?.toDate().toLocaleDateString(),
    };
  }

  async update(id: string, data: UpdateUserDto) {
    const userRef = firestoreDb.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );
    await userRef.update(updateData);

    const updatedUserDoc = await userRef.get();
    return {
      id: updatedUserDoc.id,
      ...updatedUserDoc.data(),
      createdAt: updatedUserDoc.createTime?.toDate().toLocaleDateString(),
    };
  }
}
