import { Test, TestingModule } from '@nestjs/testing';
import { LocacoesService } from './locacoes.service';

describe('LocacoesService', () => {
  let service: LocacoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocacoesService],
    }).compile();

    service = module.get<LocacoesService>(LocacoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
