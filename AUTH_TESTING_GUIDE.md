# 🧪 Guia de Teste - Sistema de Autenticação JWT

## Pré-requisitos
- Backend rodando em `http://localhost:3000`
- Frontend rodando em `http://localhost:3000` (React)
- Database configurado com TypeORM

## Como Testar

### 1️⃣ Registrar um Novo Usuário (Frontend)

**Passo a passo:**
1. Acesse `http://localhost:3000` (frontend)
2. Você será redirecionado automaticamente para `/login` (aplicação protegida)
3. Clique no botão **"Cadastre-se"**
4. Preencha o formulário:
   - **Nome**: João Silva
   - **Email**: joao@example.com
   - **Senha**: senha@123 (mínimo 6 caracteres)
5. Clique em **"Cadastrar"**
6. ✅ Se sucesso: será redirecionado para o Dashboard
7. ✅ Verá "Bem-vindo, João Silva!" na sidebar

### 2️⃣ Fazer Login (Frontend)

**Passo a passo:**
1. Clique no botão **"Sair"** (Logout) no Dashboard
2. Será redirecionado para `/login`
3. Clique em **"Faça login"** para voltar ao modo login
4. Preencha:
   - **Email**: joao@example.com
   - **Senha**: senha@123
5. Clique em **"Entrar no Sistema"**
6. ✅ Se sucesso: redirecionado para Dashboard

### 3️⃣ Testar Proteção de Rotas

**Passo a passo:**
1. Abra o navegador em modo anônimo/incógnito
2. Acesse `http://localhost:3000/clientes`
3. ✅ Você será redirecionado automaticamente para `/login`
4. Isso confirma que as rotas estão protegidas

### 4️⃣ Testar API Endpoints (Postman/Insomnia/cURL)

#### Registrar Novo Usuário
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "senha": "senha@456"
}
```

**Resposta esperada (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "nome": "Maria Silva",
    "email": "maria@example.com"
  }
}
```

#### Fazer Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha@123"
}
```

**Resposta esperada (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### Acessar Perfil Protegido
```bash
POST http://localhost:3000/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta esperada (200):**
```json
{
  "userId": 1,
  "email": "joao@example.com",
  "nome": "João Silva"
}
```

#### Tentar Acessar com Token Inválido
```bash
POST http://localhost:3000/auth/profile
Authorization: Bearer token_invalido_aqui
```

**Resposta esperada (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 5️⃣ Testar localStorage (DevTools)

**Passo a passo:**
1. Faça login no frontend
2. Abra o Console (F12)
3. Na aba **Application** → **LocalStorage** → domínio localhost
4. Você verá:
   - `auth_token`: Token JWT
   - `auth_user`: Dados do usuário em JSON

**Comando JavaScript para verificar:**
```javascript
// No console
localStorage.getItem('auth_token')
localStorage.getItem('auth_user')

JSON.parse(localStorage.getItem('auth_user'))
```

### 6️⃣ Testar Sessão Expirada

Para simular uma sessão expirada:

1. Faça login normalmente
2. Abra DevTools (F12)
3. Na aba **Application** → **LocalStorage**
4. Clique com botão direito em `auth_token` e delete
5. Tente acessar qualquer rota da aplicação
6. ✅ Será redirecionado para `/login` com mensagem de erro

Ou via JavaScript:
```javascript
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
// Agora tente navegar para qualquer rota protegida
```

### 7️⃣ Verificar Validações

**Teste de email duplicado:**
1. Registre `novo@example.com`
2. Tente registrar novamente com o mesmo email
3. ✅ Deve retornar erro: "Email já cadastrado no sistema"

**Teste de senha curta:**
1. Tente registrar com senha com menos de 6 caracteres (ex: "abc")
2. ✅ Deve retornar erro: "Senha deve ter no mínimo 6 caracteres"

**Teste de campos vazios:**
1. Deixe qualquer campo em branco
2. ✅ Campo será marcado como obrigatório pelo navegador

## 🔍 Checklist de Funcionamento

- [ ] Pode registrar novo usuário
- [ ] Pode fazer login com credenciais corretas
- [ ] Recebe token JWT após login/registro
- [ ] Token é salvo em localStorage
- [ ] Token é adicionado automaticamente nas requisições
- [ ] Rotas protegidas redirecionam para login se não autenticado
- [ ] Logout limpa dados de autenticação
- [ ] Nome do usuário aparece na sidebar após login
- [ ] Botão logout funciona corretamente
- [ ] Mensagens de erro aparecem quando apropriado
- [ ] Validações de campos funcionam (email duplicado, senha curta, etc)

## 📊 Monitorar Requisições

Para ver as requisições HTTP sendo feitas:

1. Abra DevTools (F12)
2. Vá para aba **Network**
3. Faça login
4. Observe:
   - Request para `/auth/login` com credenciais
   - Response com token JWT
   - Requisições subsequentes com header `Authorization: Bearer <token>`

## 🐛 Troubleshooting

| Problema | Solução |
|----------|----------|
| "Credenciais inválidas" | Verifique email/senha. Usuário existe? |
| "Email já cadastrado" | Use um email diferente para novo registro |
| "Rota protegida redireciona para login" | Logout? Abra DevTools e verifique localStorage |
| Token não aparece em localStorage | Verifique se login foi bem-sucedido na aba Network |
| 401 ao acessar rota protegida | Token expirou? Faça login novamente |
| CORS error | Verifique REACT_APP_API_URL no .env |

---

**Dica**: Para desenvolvimento, você pode manter DevTools aberto na aba Network para monitorar todas as requisições e respostas!
