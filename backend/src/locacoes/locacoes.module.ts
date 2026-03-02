import { Module } from '@nestjs/common';
import { LocacoesService } from './locacoes.service';
import { LocacoesController } from './locacoes.controller';

@Module({
  providers: [LocacoesService],
  controllers: [LocacoesController]
})
export class LocacoesModule {}
