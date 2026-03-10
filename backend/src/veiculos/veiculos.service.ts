import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from './veiculo.entity';

@Injectable()
export class VeiculosService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly repo: Repository<Veiculo>,
  ) {}

  create(data: Partial<Veiculo>): Promise<Veiculo> {
    const veiculo = this.repo.create(data);
    return this.repo.save(veiculo);
  }

  findAll(): Promise<Veiculo[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Veiculo | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<Veiculo>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
