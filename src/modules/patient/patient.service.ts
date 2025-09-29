import { Injectable } from '@nestjs/common';

@Injectable()
export class PatientService {
  constructor() {}

  async findAll() {
    const a = 5;
    const b = 10;
    return a + b;
  }
}
