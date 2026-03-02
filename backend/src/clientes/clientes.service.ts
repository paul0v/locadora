import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientesDomainService } from '../domain/clientes/clientes.service';
import { Cliente } from '../domain/clientes/cliente.entity';
import { NotFoundError } from '../domain/errors';

@Injectable()
export class ClientesService {
  constructor(private readonly domain: ClientesDomainService) {}

  create(data: Partial<Cliente>) {
    return this.domain.create(data);
  }

  findAll() {
    return this.domain.findAll();
  }

  async findOne(id: number) {
    try {
      return await this.domain.findOne(id);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  async update(id: number, data: Partial<Cliente>) {
    try {
      await this.domain.update(id, data);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.domain.remove(id);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
