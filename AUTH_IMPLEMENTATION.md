# Documentação - Sistema de Autenticação JWT

## ✅ Implementação Concluída

Todas as funcionalidades de autenticação com JWT foram implementadas no projeto. Abaixo está o guia completo de como o sistema funciona.

## 🏗️ Arquitetura do Sistema

### Backend (NestJS)

#### 1. **AuthService** (`src/auth/auth.service.ts`)
- `validateUser()`: Valida email e senha usando bcrypt
- `login()`: Gera JWT token para usuário autenticado
- `register()`: Registra novo usuário com validações
  - Valida se email e senha estão preenchidos
  - Valida comprimento mínimo da senha (6 caracteres)
  - Verifica se email já existe
  - Faz hash da senha com bcrypt

#### 2. **AuthController** (`src/auth/auth.controller.ts`)
- `POST /auth/login`: Endpoint de login
- `POST /auth/register`: Endpoint de registro
- `POST /auth/profile`: Retorna dados do usuário autenticado (protegido)

#### 3. **JwtStrategy & JwtAuthGuard** (`src/auth/`)
- `jwt.strategy.ts`: Estratégia de validação JWT
- `jwt-auth.guard.ts`: Guard para proteger rotas

### Frontend (React)

#### 1. **AuthContext** (`src/context/AuthContext.tsx`)
Gerencia o estado global de autenticação com:
- `user`: Dados do usuário logado
- `token`: JWT token armazenado
- `isAuthenticated`: Status de autenticação
- `login()`: Função para fazer login
- `register()`: Função para registrar
- `logout()`: Função para fazer logout

Funcionalidades:
- Persiste token no `localStorage`
- Carrega token ao iniciar app
- Injeta token no header do axios

#### 2. **Login Component** (`src/pages/Login.tsx`)
- Interface em tela única com toggle entre Login e Registro
- Validações básicas de campo
- Estados de carregamento
- Mensagens de erro/sucesso

#### 3. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
- Protege rotas que requerem autenticação
- Redireciona para `/login` se não autenticado
- Mostra tela de carregamento enquanto verifica autenticação

#### 4. **API Service** (`src/services/api.ts`)
Interceptores de requisição/resposta:
- **Request Interceptor**: Adiciona JWT token ao header
- **Response Interceptor**: 
  - Trata erros 401 (sessão expirada)
  - Limpa dados de autenticação
  - Redireciona para login

## 🔄 Fluxo de Autenticação

### Registro de Novo Usuário

```
1. Usuário acessa /login (página padrão)
2. Clica em "Cadastre-se"
3. Preenche: Nome, Email, Senha
4. POST /auth/register
   - Backend valida dados
   - Hash da senha com bcrypt
   - Cria novo funcionário
   - Retorna access_token e dados do usuário
5. Frontend armazena token no localStorage
6. Token é adicionado ao header: Authorization: Bearer <token>
7. Redireciona para Dashboard (/)
```

### Login de Usuário Existente

```
1. Usuário acessa /login
2. Preenche: Email, Senha
3. POST /auth/login
   - Backend valida credenciais
   - Compara senha com bcrypt.compare()
   - Gera JWT token
   - Retorna token e dados do usuário
4. Frontend armazena token
5. Redireciona para Dashboard
```

### Acesso a Rota Protegida

```
1. Usuário acessa rota protegida (ex: /clientes)
2. ProtectedRoute verifica isAuthenticated
3. Se autenticado: renderiza componente
4. Se não: redireciona para /login
5. Todas as requisições incluem: Authorization: Bearer <token>
```

### Sessão Expirada

```
1. Usuário faz requisição com token expirado
2. API retorna 401 Unauthorized
3. Interceptor limpa localStorage
4. Callback redireciona para /login
5. Notificação exibida ao usuário
```

## 📋 Dados Armazenados

### localStorage

```javascript
// Token JWT
localStorage.getItem('auth_token') // "eyJhbGc..."

// Dados do usuário
localStorage.getItem('auth_user') // {"id":1,"nome":"João","email":"joao@..."}
```

### Usuário (Funcionario)

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "$2a$10...bcrypt_hash..."
}
```

### JWT Token Payload

```json
{
  "email": "joao@example.com",
  "sub": 1,
  "nome": "João Silva",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## 🔐 Segurança

### Backend
- ✅ Senha com hash bcrypt (10 salts)
- ✅ JWT token com expiração
- ✅ Email único obrigatório
- ✅ Guards protegem rotas sensíveis

### Frontend
- ✅ Token salvo em localStorage
- ✅ Token incluído automaticamente em todas requisições
- ✅ Rotas protegidas com ProtectedRoute
- ✅ Logout limpa tokens e dados
- ✅ Tratamento de sessão expirada

## 🚀 Como Testar

### 1. Registrar Novo Usuário

```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com"
  }
}
```

### 2. Fazer Login

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

### 3. Acessar Dados Protegidos

```
POST http://localhost:3000/auth/profile
Authorization: Bearer eyJhbGc...

Response:
{
  "userId": 1,
  "email": "joao@example.com",
  "nome": "João Silva"
}
```

## 📝 Enviáveis da Implementação

### Backend
- ✅ `auth/auth.service.ts` - Serviço com `register()`
- ✅ `auth/auth.controller.ts` - Endpoint `/auth/register`

### Frontend
- ✅ `context/AuthContext.tsx` - Context de autenticação
- ✅ `components/ProtectedRoute.tsx` - Protetor de rotas
- ✅ `pages/Login.tsx` - Página com Login + Registro
- ✅ `pages/Login.css` - Estilos atualizados
- ✅ `components/Layout.tsx` - Exibe nome do usuário + logout real
- ✅ `services/api.ts` - Interceptadores JWT
- ✅ `App.tsx` - AuthProvider + Callbacks

## ⚙️ Variáveis de Ambiente

Certifique-se de que está configurado no `.env` do frontend:

```
REACT_APP_API_URL=http://localhost:3000
```

## 🎯 Próximos Passos (Opcional)

1. **Refresh Token**: Implementar refresh token para renovar sessão
2. **Roles/Permissões**: Adicionar roles de usuário (admin, gerente, etc)
3. **2FA**: Autenticação de dois fatores
4. **Email Verification**: Verificar email ao registrar
5. **Password Reset**: Recuperação de senha
6. **Rate Limiting**: Limitar tentativas de login

---

**Status**: ✅ Sistema de autenticação com JWT totalmente configurado e funcional!
