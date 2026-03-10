# 🔧 GUIA DE CORREÇÃO - PROBLEMAS ENCONTRADOS

## 🚨 PROBLEMA 1: TESTES DE VEÍCULOS FALHANDO

### Erro Original:
```
Nest can't resolve dependencies of the VeiculosService (?). 
Please make sure that the argument "VeiculoRepository" at index [0] is available in the RootTestModule context.
```

### Causa:
O `VeiculosService` está injetando `@InjectRepository(Veiculo)`, mas os testes spec não estão mockando o TypeORM Repository.

### Solução 1: Arquivo `veiculos.service.spec.ts`

**ANTES (Quebrado ❌):**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { VeiculosService } from './veiculos.service';

describe('VeiculosService', () => {
  let service: VeiculosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VeiculosService],
    }).compile();

    service = module.get<VeiculosService>(VeiculosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

**DEPOIS (Corrigido ✓):**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { VeiculosService } from './veiculos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Veiculo } from './veiculo.entity';

describe('VeiculosService', () => {
  let service: VeiculosService;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeiculosService,
        {
          provide: getRepositoryToken(Veiculo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VeiculosService>(VeiculosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a veiculo', async () => {
    const mockVeiculo = {
      id: 1,
      placa: 'ABC-1234',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2023,
      categoria: 'Sedan',
      status: 'DISPONIVEL',
    };

    const module = await Test.createTestingModule({
      providers: [
        VeiculosService,
        {
          provide: getRepositoryToken(Veiculo),
          useValue: {
            create: jest.fn().mockReturnValue(mockVeiculo),
            save: jest.fn().mockResolvedValue(mockVeiculo),
          },
        },
      ],
    }).compile();

    const service = module.get<VeiculosService>(VeiculosService);
    expect(await service.create(mockVeiculo)).toEqual(mockVeiculo);
  });
});
```

### Solução 2: Arquivo `veiculos.controller.spec.ts`

**DEPOIS (Corrigido ✓):**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';

describe('VeiculosController', () => {
  let controller: VeiculosController;
  let service: VeiculosService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeiculosController],
      providers: [
        {
          provide: VeiculosService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<VeiculosController>(VeiculosController);
    service = module.get<VeiculosService>(VeiculosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all veiculos', async () => {
    const mockVeiculos = [
      {
        id: 1,
        placa: 'ABC-1234',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        categoria: 'Sedan',
        status: 'DISPONIVEL',
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(mockVeiculos);

    expect(await controller.findAll()).toEqual(mockVeiculos);
  });
});
```

---

## 🔌 PROBLEMA 2: SERVIÇO DE LOCAÇÕES VAZIO

### Erro Original:
```typescript
@Injectable()
export class LocacoesService {}
```

### Solução: Implementar `locacoes.service.ts`

**IMPLEMENTAÇÃO COMPLETA:**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locacao, StatusLocacao } from './locacao.entity';

@Injectable()
export class LocacoesService {
  constructor(
    @InjectRepository(Locacao)
    private readonly repo: Repository<Locacao>,
  ) {}

  async create(data: Partial<Locacao>): Promise<Locacao> {
    const locacao = this.repo.create({
      ...data,
      status: StatusLocacao.ATIVA,
    });
    return this.repo.save(locacao);
  }

  async findAll(): Promise<Locacao[]> {
    return this.repo.find({
      relations: ['cliente', 'veiculo'],
    });
  }

  async findById(id: number): Promise<Locacao> {
    const locacao = await this.repo.findOne({
      where: { id },
      relations: ['cliente', 'veiculo'],
    });
    if (!locacao) {
      throw new NotFoundException(`Locação #${id} não encontrada`);
    }
    return locacao;
  }

  async update(id: number, data: Partial<Locacao>): Promise<void> {
    const locacao = await this.findById(id);
    if (!locacao) {
      throw new NotFoundException(`Locação #${id} não encontrada`);
    }
    await this.repo.update(id, data);
  }

  async finalizarLocacao(id: number, dataDevolucaoReal: Date): Promise<void> {
    const locacao = await this.findById(id);
    if (!locacao) {
      throw new NotFoundException(`Locação #${id} não encontrada`);
    }
    await this.repo.update(id, {
      dataDevolucaoReal,
      status: StatusLocacao.FINALIZADA,
    });
  }

  async delete(id: number): Promise<void> {
    const locacao = await this.findById(id);
    if (!locacao) {
      throw new NotFoundException(`Locação #${id} não encontrada`);
    }
    await this.repo.delete(id);
  }
}
```

### Implementar `locacoes.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LocacoesService } from './locacoes.service';
import { Locacao } from './locacao.entity';

@Controller('locacoes')
export class LocacoesController {
  constructor(private readonly service: LocacoesService) {}

  @Get()
  findAll(): Promise<Locacao[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Locacao> {
    return this.service.findById(Number(id));
  }

  @Post()
  create(@Body() body: Partial<Locacao>): Promise<Locacao> {
    return this.service.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Locacao>,
  ): Promise<void> {
    return this.service.update(Number(id), body);
  }

  @Put(':id/finalizar')
  async finalizarLocacao(
    @Param('id') id: string,
    @Body() body: { dataDevolucaoReal: Date },
  ): Promise<void> {
    return this.service.finalizarLocacao(Number(id), body.dataDevolucaoReal);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.delete(Number(id));
  }
}
```

### Atualizar `locacoes.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locacao } from './locacao.entity';
import { LocacoesService } from './locacoes.service';
import { LocacoesController } from './locacoes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Locacao])],
  providers: [LocacoesService],
  controllers: [LocacoesController],
})
export class LocacoesModule {}
```

---

## 🔐 PROBLEMA 3: SERVIÇO DE AUTH VAZIO

### Erro Original:
```typescript
@Injectable()
export class AuthService {}
```

### Solução: Implementar `auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nome: string;
}

export interface AuthPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: AuthPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
    });
  }

  validateToken(token: string): AuthPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  // Exemplo de login (você precisará adicionar um service de usuários)
  async login(credentials: LoginDto) {
    // TODO: Integrar com cliente/usuário
    const token = this.generateToken({
      sub: 1,
      email: credentials.email,
    });
    return { access_token: token };
  }
}
```

---

## 📋 CHECKLIST DE CORREÇÃO

```
☐ Corrigir veiculos.service.spec.ts
  ☐ Adicionar mock Repository
  ☐ Adicionar testes de CRUD
  
☐ Corrigir veiculos.controller.spec.ts
  ☐ Adicionar mock Service
  ☐ Adicionar testes de endpoints
  
☐ Implementar LocacoesService
  ☐ CRUD completo
  ☐ Método finalizarLocacao
  ☐ Relations com Cliente e Veiculo
  
☐ Implementar LocacoesController
  ☐ GET /locacoes
  ☐ GET /locacoes/:id
  ☐ POST /locacoes
  ☐ PUT /locacoes/:id
  ☐ PUT /locacoes/:id/finalizar
  ☐ DELETE /locacoes/:id
  
☐ Implementar AuthService
  ☐ Hashing de password
  ☐ Validação de password
  ☐ JWT generation
  ☐ JWT validation
  
☐ Rodar testes novamente
  ☐ npm test (deve passar 8/8)
  
☐ Criar páginas frontend faltantes
  ☐ Veiculos.tsx
  ☐ Locacoes.tsx
  ☐ Dashboard.tsx (completo)
```

---

## 🧪 COMO RODAR OS TESTES

```bash
# Teste individual
npm test -- --testPathPattern="veiculos"

# Todos os testes
npm test

# Com cobertura
npm test:cov

# Watch mode
npm test:watch
```

---

## ✅ VALIDAÇÃO FINAL

Após aplicar as correções:

```bash
# 1. Compilar sem erros
npm run build

# 2. Todos os testes devem passar
npm test

# 3. Lint sem warnings
npm run lint
```

**Resultado Esperado:**
```
PASS  src/domain/clientes/clientes.service.spec.ts
PASS  src/auth/auth.service.spec.ts
PASS  src/locacoes/locacoes.controller.spec.ts
PASS  src/clientes/clientes.service.spec.ts
PASS  src/app.controller.spec.ts
PASS  src/locacoes/locacoes.service.spec.ts
PASS  src/auth/auth.controller.spec.ts
PASS  src/clientes/clientes.controller.spec.ts
PASS  src/veiculos/veiculos.service.spec.ts
PASS  src/veiculos/veiculos.controller.spec.ts

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

---

*Última atualização: 09/03/2026*
