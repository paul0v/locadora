import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locacao, StatusLocacao } from './locacao.entity';
import { Cliente } from '../domain/clientes/cliente.entity';
import { Veiculo, StatusVeiculo } from '../veiculos/veiculo.entity';
import { Funcionario } from '../funcionario/funcionario.entity';

@Injectable()
export class LocacoesService {
  constructor(
    @InjectRepository(Locacao)
    private readonly locacaoRepo: Repository<Locacao>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Veiculo)
    private readonly veiculoRepo: Repository<Veiculo>,
    @InjectRepository(Funcionario)
    private readonly funcionarioRepo: Repository<Funcionario>,
  ) {}

  async create(data: {
    clienteId: number;
    veiculoId: number;
    funcionarioId: number;
    dataRetirada: Date;
    dataDevolucaoPrevista: Date;
    valorPrevisto: number;
  }): Promise<Locacao> {
    const cliente = await this.clienteRepo.findOneBy({ id: data.clienteId });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const veiculo = await this.veiculoRepo.findOneBy({ id: data.veiculoId });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    const funcionario = await this.funcionarioRepo.findOneBy({
      id: data.funcionarioId,
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    if (veiculo.status !== StatusVeiculo.DISPONIVEL) {
      throw new BadRequestException('Veículo não está disponível');
    }

    const locacao = this.locacaoRepo.create({
      cliente,
      veiculo,
      funcionario,
      dataRetirada: new Date(data.dataRetirada),
      dataDevolucaoPrevista: new Date(data.dataDevolucaoPrevista),
      valorPrevisto: data.valorPrevisto,
      status: StatusLocacao.ATIVA,
    });

    // Atualizar status do veículo
    veiculo.status = StatusVeiculo.ALUGADO;
    await this.veiculoRepo.save(veiculo);

    return this.locacaoRepo.save(locacao);
  }

  async findAll(): Promise<Locacao[]> {
    return this.locacaoRepo.find({
      relations: ['cliente', 'veiculo', 'funcionario'],
    });
  }

  async findById(id: number): Promise<Locacao | null> {
    return this.locacaoRepo.findOne({
      where: { id },
      relations: ['cliente', 'veiculo', 'funcionario'],
    });
  }

  async finalizar(id: number, valorFinal: number): Promise<void> {
    const locacao = await this.findById(id);
    if (!locacao) throw new NotFoundException('Locação não encontrada');

    locacao.dataDevolucaoEfetiva = new Date();
    locacao.valorFinal = valorFinal;
    locacao.status = StatusLocacao.FINALIZADA;
    await this.locacaoRepo.save(locacao);

    // Liberar veículo
    locacao.veiculo.status = StatusVeiculo.DISPONIVEL;
    await this.veiculoRepo.save(locacao.veiculo);
  }

  async delete(id: number): Promise<void> {
    const locacao = await this.findById(id);
    if (!locacao) throw new NotFoundException('Locação não encontrada');

    if (locacao.status === StatusLocacao.ATIVA) {
      locacao.veiculo.status = StatusVeiculo.DISPONIVEL;
      await this.veiculoRepo.save(locacao.veiculo);
    }

    await this.locacaoRepo.delete(id);
  }
}
