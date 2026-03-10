import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria) private readonly repo: Repository<Categoria>,
  ) {}

  create(data: Partial<Categoria>): Promise<Categoria> {
    return this.repo.save(this.repo.create(data));
  }

  findAll(): Promise<Categoria[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Categoria | null> {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, data: Partial<Categoria>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
