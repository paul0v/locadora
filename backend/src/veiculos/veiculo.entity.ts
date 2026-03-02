import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum StatusVeiculo {
  DISPONIVEL = 'DISPONIVEL',
  ALUGADO = 'ALUGADO',
  MANUTENCAO = 'MANUTENCAO',
}

@Entity()
export class Veiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  placa: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  ano: number;

  @Column()
  categoria: string;

  @Column({
    type: 'enum',
    enum: StatusVeiculo,
    default: StatusVeiculo.DISPONIVEL,
  })
  status: StatusVeiculo;
}
