import { Test, TestingModule } from '@nestjs/testing';
import { LocacoesController } from './locacoes.controller';

describe('LocacoesController', () => {
  let controller: LocacoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocacoesController],
    }).compile();

    controller = module.get<LocacoesController>(LocacoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
