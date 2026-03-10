# 📐 DIAGRAMA DO PROJETO - VISUAL ARCHITECTURE

## 🏗️ ARQUITETURA GERAL (Current State)

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + TypeScript)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Pages:                          Components:                     │
│  ✅ Login.tsx                    ✅ Layout.tsx                   │
│  ✅ Dashboard.tsx                ✅ Modal.tsx                    │
│  ✅ Clientes.tsx                 ✅ ClienteForm.tsx              │
│  ✅ Relatorios.tsx               ❌ VeiculoForm.tsx              │
│  ❌ Veiculos.tsx                 ❌ LocacaoForm.tsx              │
│  ❌ Locacoes.tsx                                                 │
│                                                                   │
│  Service:                                                        │
│  └─ api.ts (axios client)                                       │
│     baseURL: http://localhost:3000                              │
│                                                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP/JSON
┌────────────────────────▼─────────────────────────────────────────┐
│             BACKEND (NestJS + TypeScript)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  REST API (Controllers):                                        │
│  ├─ ✅ GET    /clientes        ← List all                       │
│  ├─ ✅ POST   /clientes        ← Create                          │
│  ├─ ✅ GET    /clientes/:id    ← Get one                         │
│  ├─ ✅ PUT    /clientes/:id    ← Update                          │
│  ├─ ✅ DELETE /clientes/:id    ← Delete                          │
│  │                                                              │
│  ├─ ✅ GET    /veiculos         ← List all                       │
│  ├─ ⚠️  Others (same CRUD)                                      │
│  │                                                              │
│  ├─ ⚠️  GET    /locacoes        ← List all                       │
│  ├─ ⚠️  Others (same CRUD)                                      │
│  │                                                              │
│  └─ ⚠️  POST   /auth/login      ← Auth                           │
│     POST   /auth/register   ← Auth                              │
│                                                                   │
│  Modules:                                                        │
│  ├─ ClientesModule              ✅ 100% (Reference)             │
│  ├─ VeiculosModule              ⚠️  70% (Testes quebrados)      │
│  ├─ LocacoesModule              ❌ 30% (Vazio)                   │
│  ├─ AuthModule                  ❌ 30% (Vazio)                   │
│  └─ AppModule (root)                                            │
│                                                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │ TypeORM
┌────────────────────────▼─────────────────────────────────────────┐
│           DATABASE (PostgreSQL)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tables/Entities:                                               │
│  ├─ cliente                     ✅ Ready                         │
│  │  ├─ id (PK)                                                  │
│  │  ├─ nome (Required)                                          │
│  │  ├─ cpf (Unique)                                             │
│  │  ├─ cnh (Required)                                           │
│  │  ├─ telefone (Required)                                      │
│  │  └─ email (Required)                                         │
│  │                                                              │
│  ├─ veiculo                     ✅ Ready                         │
│  │  ├─ id (PK)                                                  │
│  │  ├─ placa (Unique)                                           │
│  │  ├─ marca                                                    │
│  │  ├─ modelo                                                   │
│  │  ├─ ano                                                      │
│  │  ├─ categoria                                                │
│  │  └─ status (enum)                                            │
│  │                                                              │
│  └─ locacao                     ✅ Ready                         │
│     ├─ id (PK)                                                  │
│     ├─ cliente_id (FK)                                          │
│     ├─ veiculo_id (FK)                                          │
│     ├─ dataRetirada                                             │
│     ├─ dataDevolucaoPrevista                                    │
│     ├─ dataDevolucaoReal (nullable)                             │
│     └─ status (enum)                                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW - Criar Cliente (Exemplo)

```
                       FRONTEND
                    React Component
                          │
                          ▼
            ClienteForm.tsx (validação)
                 │ inputs: nome, cpf, email, etc
                 │ validates: regex, length, etc
                 │ onSubmit(data)
                 │
                 ▼ ✅ Data válido
            api.post('/clientes', data)
        (axios → HTTP POST)
                 │
                 ▼ HTTP
        POST /clientes
           Content-Type: application/json
           Body: { nome, cpf, email, telefone, cnh }
                 │
                 ▼ BACKEND
        ┌─ ClientesController
        │  @Post()
        │  @UsePipes(ValidationPipe)
        │  create(@Body() data: CreateClienteDto)
        │
        │  ✓ DTO Validation
        │  │ @IsString()
        │  │ @Length(3, 100)
        │  │ nome
        │  │
        │  │ @IsEmail()
        │  │ email
        │  │ etc...
        │
        ├─ ClientesService (App Layer)
        │ create(data) {
        │   return this.domain.create(data)
        │ }
        │
        ├─ ClientesDomainService (Domain)
        │ async create(data) {
        │   return this.repository.create(data)
        │ }
        │
        ├─ TypeOrmClienteRepository (Data)
        │ create(data) {
        │   const cliente = this.repo.create(data)
        │   return this.repo.save(cliente)
        │ }
        │
        └─ TypeORM
           INSERT INTO cliente (nome, cpf, ...)
           VALUES ('João', '123...', ...)
           RETURNING *
                 │
                 ▼ Database
            PostgreSQL
           client_id = 1
           Successfully inserted
                 │
                 ▼ Response
        ┌─────────────────────────┐
        │ 201 Created             │
        │ {                       │
        │   "id": 1,              │
        │   "nome": "João",       │
        │   "cpf": "123...",      │
        │   "email": "...",       │
        │   "telefone": "...",    │
        │   "cnh": "..."          │
        │ }                       │
        └─────────────────────────┘
                 │
                 ▼ FRONTEND
            Response recebida
            State atualizado
            Lista re-renderiza
            ✅ Novo cliente aparece
```

---

## 🧪 TESTES - Estado Atual

```
                    npm test
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   DOMAIN TESTS    SERVICE TESTS   CONTROLLER TESTS
        │               │               │
   ┌────┴────┐      ┌────┴────┐   ┌────┴───────┐
   │ ✅ PASS │      │ ✅ PASS │   │ ✅ PASS    │
   └────┬────┘      └────┬────┘   └────┬───────┘
        │               │              │
   ClientesDomain  ClientesService  ClientesController
        │               │              │
        └───────┬───────┴──────────────┘
                │
         Domain Service ✅
         Validação Errors ✅
         HTTP Errors ✅
         
                        │
                    Veiculos       ❌ FAIL
                        │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
        Service      Controller    Module
        FAIL ❌        FAIL ❌      NOT TESTED
        Error:        Error:
        Resolve       Resolve
        VeiculoRepo   VeiculoService

                        │
                    Locacoes       ⚠️ NOT TESTED
                        │
     (Service é vazio, testes não rodam)

                        │
                    Auth           ⚠️ NOT TESTED
                        │
     (Service é vazio, testes não rodam)

                    Result: 6/8 PASS (75%)
```

---

## 📦 ESTRUTURA DE PASTAS

```
locadora/
├── backend/                          # NestJS Application
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── main.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts        (EMPTY ❌)
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts           (EMPTY ❌)
│   │   │   └── auth.service.spec.ts      (PASS ✅)
│   │   │
│   │   ├── clientes/                     (REFERENCE ✅✅✅)
│   │   │   ├── clientes.controller.ts    (PASS ✅)
│   │   │   ├── clientes.controller.spec.ts
│   │   │   ├── clientes.service.ts       (PASS ✅)
│   │   │   ├── clientes.service.spec.ts
│   │   │   ├── clientes.module.ts
│   │   │   ├── cliente.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-cliente.dto.ts
│   │   │       └── update-cliente.dto.ts
│   │   │
│   │   ├── domain/                      (Pure business logic)
│   │   │   ├── clientes/
│   │   │   │   ├── cliente.entity.ts
│   │   │   │   ├── cliente.repository.ts (interface)
│   │   │   │   └── clientes.service.ts   (PASS ✅)
│   │   │   └── errors/
│   │   │       └── not-found.error.ts
│   │   │
│   │   ├── locacoes/                    (INCOMPLETE ❌)
│   │   │   ├── locacao.entity.ts
│   │   │   ├── locacoes.controller.ts    (EMPTY ❌)
│   │   │   ├── locacoes.module.ts
│   │   │   └── locacoes.service.ts       (EMPTY ❌)
│   │   │
│   │   └── veiculos/                    (INCOMPLETE ⚠️)
│   │       ├── veiculo.entity.ts
│   │       ├── veiculos.controller.ts
│   │       ├── veiculos.controller.spec.ts (FAIL ❌)
│   │       ├── veiculos.module.ts
│   │       ├── veiculos.service.ts
│   │       └── veiculos.service.spec.ts  (FAIL ❌)
│   │
│   ├── test/
│   │   └── app.e2e-spec.ts
│   │
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ClienteForm.tsx       (COMPLETE ✅)
│   │   │   ├── Layout.tsx            (COMPLETE ✅)
│   │   │   └── Modal.tsx             (COMPLETE ✅)
│   │   │
│   │   ├── pages/
│   │   │   ├── Clientes.tsx          (COMPLETE ✅✅✅)
│   │   │   ├── Dashboard.tsx         (PARTIAL ⚠️)
│   │   │   ├── Login.tsx             (COMPLETE ✅)
│   │   │   ├── Locacoes.tsx          (MISSING ❌)
│   │   │   ├── Relatorios.tsx        (COMPLETE ✅)
│   │   │   └── Veiculos.tsx          (MISSING ❌)
│   │   │
│   │   └── services/
│   │       └── api.ts                (CONFIGURED ✅)
│   │
│   ├── public/
│   ├── build/
│   ├── package.json
│   └── tsconfig.json
│
├── README.md                         (MINIMAL)
├── ANALISE_COMPLETA.md              (GENERATED)
├── ANALISE_MODULO_CLIENTES.md       (GENERATED)
├── GUIA_CORRECAO.md                 (GENERATED)
├── QUICK_REFERENCE.md               (GENERATED)
└── SUMARIO_EXECUTIVO.md             (GENERATED)
```

---

## 📊 MATRIZ DE STATUS

```
┌────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Componente     │ Backend  │ Frontend │ Testes   │ Banco    │ Overall  │
├────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Clientes       │   ✅ 5/5 │  ✅ 5/5  │  ✅ 8/8  │  ✅ Ready│  ✅ 100% │
│ Veículos       │   ✅ 5/5 │   ❌ 0/1 │  ❌ 0/2  │  ✅ Ready│  ⚠️  60% │
│ Locações       │   ❌ 1/5 │   ❌ 0/1 │  ⚠️  0/3 │  ✅ Ready│  ❌ 30% │
│ Auth           │   ❌ 1/5 │   ⚠️  1/2│  ⚠️  0/3 │  ✅ Ready│  ❌ 20% │
│ Utils/Config   │   ✅ 5/5 │  ✅ 3/3  │  ✅ 1/1  │  ✅ OK   │  ✅ 90% │
├────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ TOTAL          │  87%     │  70%     │  75%     │  100%    │  ⚠️  75% │
└────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🔄 CICLO DE DESENVOLVIMENTO RECOMENDADO

```
Day 1 (1 hora - Backend Quick Fixes)
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Fix Veiculos  Implement  Implement
   Tests (5min) LocacoesService AuthService
                 (30min)      (25min)
        │           │           │
        └───────────┼───────────┘
                    ▼
            npm test (8/8 ✅)
                    │
                    ▼
        Backend Ready for Production
                    │
                    │
Day 2 (3 horas - Frontend + Testing)
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Create       Create        Test
   Veiculos.tsx Locacoes.tsx  Integration
   (1h)         (1h)          (1h)
        │           │           │
        └───────────┼───────────┘
                    ▼
        Connect Frontend ↔ Backend
                    │
                    ▼
        Test PostgreSQL + JWT Auth
                    │
                    ▼
            Project Complete ✅
```

---

## 🎯 DEPENDÊNCIAS

```
Backend:
├─ @nestjs/common        (Core framework)
├─ @nestjs/typeorm       (Database ORM)
├─ @nestjs/jwt           (Auth)
├─ @nestjs/passport      (Auth middleware)
├─ typeorm               (Database)
├─ pg                    (PostgreSQL driver)
├─ bcrypt                (Password hashing)
├─ class-validator       (Validation)
├─ class-transformer     (Transform)
└─ jest                  (Testing)

Frontend:
├─ react                 (UI Framework)
├─ react-router-dom      (Routing)
├─ axios                 (HTTP Client)
├─ recharts              (Charts)
├─ tabler-icons-react    (Icons)
└─ typescript            (Type Safety)
```

---

## 🚀 DEPLOYMENT

```
Local Development:
├─ npm install (both backend & frontend)
├─ Backend: npm run start:dev
├─ Frontend: npm start
└─ PostgreSQL: Local instance

Production:
├─ Backend: npm run build → node dist/main
├─ Frontend: npm run build → deploy static files
├─ Database: Managed PostgreSQL service
└─ Auth: JWT with secure tokens
```

---

*Última atualização: 09/03/2026*
