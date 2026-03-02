import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientesModule } from './clientes/clientes.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { LocacoesModule } from './locacoes/locacoes.module';
import { AuthModule } from './auth/auth.module';

import { Cliente } from './domain/clientes/cliente.entity';
import { Veiculo } from './veiculos/veiculo.entity';
import { Locacao } from './locacoes/locacao.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'locadora',
      entities: [Cliente, Veiculo, Locacao],
      synchronize: true,
    }),
    ClientesModule,
    VeiculosModule,
    LocacoesModule,
    AuthModule,
  ],
})
export class AppModule {}
