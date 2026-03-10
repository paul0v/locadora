# 🎯 QUICK REFERENCE - CHECKLIST DE AÇÕES

## 📋 PROBLEMAS E SOLUÇÕES - ONE PAGE

### ❌ PROBLEMA 1: Veículos - Testes Falhando

**O que fazer:**
```bash
# Editar arquivo: backend/src/veiculos/veiculos.service.spec.ts
# Adicionar antes de beforeEach():
import { getRepositoryToken } from '@nestjs/typeorm';
import { Veiculo } from './veiculo.entity';

# Dentro do beforeEach, substituir:
const module: TestingModule = await Test.createTestingModule({
  providers: [
    VeiculosService,
    {
      provide: getRepositoryToken(Veiculo),
      useValue: {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    },
  ],
}).compile();
```

**Tempo:** 5 minutos  
**Impacto:** 1 teste passa ✓

---

### ❌ PROBLEMA 2: Veículos - Controller Test Falhando

**O que fazer:**
```bash
# Editar arquivo: backend/src/veiculos/veiculos.controller.spec.ts
# Adicionar antes de beforeEach():
import { VeiculosService } from './veiculos.service';

# Dentro do beforeEach, substituir:
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
```

**Tempo:** 5 minutos  
**Impacto:** 1 teste passa ✓

---

### ❌ PROBLEMA 3: Locações - Service Vazio

**Arquivo afetado:** `backend/src/locacoes/locacoes.service.ts`

**Solução rápida:** Copie este código inteiro
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
    await this.findById(id);
    await this.repo.update(id, data);
  }

  async finalizarLocacao(id: number, dataDevolucaoReal: Date): Promise<void> {
    await this.findById(id);
    await this.repo.update(id, {
      dataDevolucaoReal,
      status: StatusLocacao.FINALIZADA,
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }
}
```

**Tempo:** 30 minutos  
**Impacto:** Locações funcionam ✓

---

### ❌ PROBLEMA 4: Locações - Controller Vazio

**Arquivo afetado:** `backend/src/locacoes/locacoes.controller.ts`

**Solução rápida:** Copie este código inteiro
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

**Tempo:** 5 minutos  
**Impacto:** Endpoints de Locações funcionam ✓

---

### ❌ PROBLEMA 5: Auth - Service Vazio

**Arquivo afetado:** `backend/src/auth/auth.service.ts`

**Solução rápida:** Copie este código inteiro
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
}
```

**Tempo:** 10 minutos  
**Impacto:** Auth service pronto pra usar ✓

---

## 🧪 VERIFICAR PROGRESSO

```bash
# Terminal 1 - Rodar os testes
cd backend
npm test

# Resultado esperado ANTES:
# PASS 6 out of 8
# FAIL veiculos.service.spec.ts
# FAIL veiculos.controller.spec.ts

# Resultado esperado DEPOIS:
# PASS 8 out of 8
# All tests passed ✓
```

---

## 📱 FRONTEND FALTANDO

Se quiser implementar as páginas de Veículos e Locações no frontend:

**Copie de:** `frontend/src/pages/Clientes.tsx`

**Para:** `frontend/src/pages/Veiculos.tsx` e `frontend/src/pages/Locacoes.tsx`

**Ajustes mínimos necesários:**
- Trocar `clientes` por `veiculos` ou `locacoes`
- Trocar `/clientes` por `/veiculos` ou `/locacoes`
- Trocar interface `Cliente` por `Veiculo` ou `Locacao`
- Trocar campos da tabela conforme entidade

**Tempo:** ~1 hora para as 2 páginas

---

## 🔄 FLUXO DE IMPLEMENTAÇÃO RECOMENDADO

1. **Corrigir Veículos Tests** (5 min) ← COMECE AQUI
2. **Implementar LocacoesService** (30 min) 
3. **Implementar LocacoesController** (5 min)
4. **Implementar AuthService** (10 min)
5. **Rodar testes novamente** npm test (deve passar 8/8)
6. ✅ **Backend completo!** (Total: ~1 hora)

---

## 💾 VALIDAÇÃO FINAL

```bash
# 1. Compilar
npm run build
# Esperado: ✅ Build successful

# 2. Lint
npm run lint
# Esperado: ✅ No errors

# 3. Testes
npm test
# Esperado: ✅ 8/8 tests passing

# 4. Start dev
npm run start:dev
# Esperado: ✅ Application running on http://localhost:3000
```

---

## 🎯 CHECKLIST FINAL

```
BACKEND:
☐ Corrigir veiculos.service.spec.ts
☐ Corrigir veiculos.controller.spec.ts
☐ Implementar LocacoesService (CRUD)
☐ Implementar LocacoesController (endpoints)
☐ Implementar AuthService (JWT)
☐ npm test → 8/8 passando
☐ npm run build → sucesso
☐ npm run lint → sem erros

FRONTEND (optional):
☐ Criar Veiculos.tsx (cópia de Clientes)
☐ Criar Locacoes.tsx (cópia de Clientes)
☐ Adicionar rotas no Menu/Layout
☐ Testar fluxo completo

DATABASE:
☐ Criar arquivo .env
☐ Instalar PostgreSQL
☐ npm start (TypeORM sincronizará)
☐ Testar endpoints

VALIDAÇÃO:
☐ Todos testes passando
☐ Build sem erros
☐ Lint sem warnings
☐ App inicia sem erros
☐ Endpoints responden via curl/Postman
```

---

## 📞 CONTATO RÁPIDO

**Arquivos importantes:**
- Backend: `backend/src/`
- Frontend: `frontend/src/`
- Configuração: `backend/src/app.module.ts`
- DB Connection: Espera arquivo `.env`

**Testes:**
- Execute: `npm test` na pasta backend
- Watch: `npm test:watch`
- Coverage: `npm test:cov`

---

## ⚡ QUICK COPY-PASTE

### Para Adicionar Módulo TypeOrmModule no app.module.ts:
```typescript
import { Locacao } from './locacoes/locacao.entity';

// Em entities array:
entities: [Cliente, Veiculo, Locacao],
```

### Para Exportar Module:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocacoesService } from './locacoes.service';
import { LocacoesController } from './locacoes.controller';
import { Locacao } from './locacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Locacao])],
  providers: [LocacoesService],
  controllers: [LocacoesController],
})
export class LocacoesModule {}
```

---

**Total de tempo para completar:** ~1 hora (Backend 75%, Frontend 25%)

---

*Quick Reference - Última atualização: 09/03/2026*
