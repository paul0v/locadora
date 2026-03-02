import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cliente } from '../domain/clientes/cliente.entity';
import { Veiculo } from '../veiculos/veiculo.entity';

export enum StatusLocacao {
  ATIVA = 'ATIVA',
  FINALIZADA = 'FINALIZADA',
}

@Entity()
export class Locacao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente)
  cliente: Cliente;

  @ManyToOne(() => Veiculo)
  veiculo: Veiculo;

  @Column()
  dataRetirada: Date;

  @Column()
  dataDevolucaoPrevista: Date;

  @Column({ nullable: true })
  dataDevolucaoReal: Date;

  @Column({
    type: 'enum',
    enum: StatusLocacao,
    default: StatusLocacao.ATIVA,
  })
  status: StatusLocacao;
}
