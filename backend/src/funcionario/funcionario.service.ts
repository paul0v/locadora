import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funcionario } from './funcionario.entity';

@Injectable()
export class FuncionariosService {
  constructor(
    @InjectRepository(Funcionario)
    private readonly repo: Repository<Funcionario>,
  ) {}

  create(data: Partial<Funcionario>): Promise<Funcionario> {
    return this.repo.save(this.repo.create(data));
  }

  findAll(): Promise<Funcionario[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Funcionario | null> {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, data: Partial<Funcionario>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
