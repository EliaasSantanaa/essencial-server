import { Module } from '@nestjs/common';
import { FirebaseConfigService } from './firebase.config';

@Module({
  providers: [FirebaseConfigService],
  exports: [FirebaseConfigService], // Exporta o serviço para outros módulos
})
export class FirebaseModule {}