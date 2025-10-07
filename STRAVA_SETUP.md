# Guia de Configuração do Strava API

Este guia explica como configurar corretamente a integração com o Strava API após fazer o deploy da aplicação no GitHub Pages.

## 📋 Pré-requisitos

- Aplicação LeRunners já deployada no GitHub Pages
- Conta Strava Developer ativa
- URL final da aplicação (ex: `https://seu-usuario.github.io/lerunners-app`)

## 🔧 Configuração Passo a Passo

### 1. Acesse o Portal de Desenvolvedores do Strava

1. Vá para [https://developers.strava.com/](https://developers.strava.com/)
2. Faça login com sua conta Strava
3. Clique em **"My API Application"**

### 2. Edite sua Aplicação Existente

Se você já criou a aplicação durante o desenvolvimento:

1. Clique no nome da sua aplicação (ex: "LeRunners App")
2. Clique em **"Edit"** ou **"Update Application"**

Se ainda não criou, clique em **"Create New Application"**.

### 3. Configure os Campos Obrigatórios

Preencha os seguintes campos com os valores corretos:

| Campo | Valor | Exemplo |
|-------|-------|---------|
| **Application Name** | LeRunners App | LeRunners App |
| **Category** | Training | Training |
| **Club** | (deixe em branco) | - |
| **Website** | URL completa do GitHub Pages | `https://seu-usuario.github.io/lerunners-app` |
| **Authorization Callback Domain** | Apenas o domínio | `seu-usuario.github.io` |

### 4. Exemplo de Configuração Completa

```
Application Name: LeRunners App
Category: Training
Club: (vazio)
Website: https://joaosilva.github.io/lerunners-app
Authorization Callback Domain: joaosilva.github.io
Description: Plataforma de gestão de treinos para atletas e professores de corrida
```

### 5. Salve as Alterações

1. Clique em **"Update Application"**
2. Anote o **Client ID** e **Client Secret** (se mudaram)

## ⚠️ Pontos Importantes

### Authorization Callback Domain

- **CORRETO**: `seu-usuario.github.io`
- **INCORRETO**: `https://seu-usuario.github.io/lerunners-app`
- **INCORRETO**: `seu-usuario.github.io/lerunners-app`

O campo deve conter **apenas o domínio**, sem protocolo (https://) e sem path (/lerunners-app).

### Website URL

- **CORRETO**: `https://seu-usuario.github.io/lerunners-app`
- **INCORRETO**: `seu-usuario.github.io/lerunners-app`
- **INCORRETO**: `https://seu-usuario.github.io`

O campo deve conter a **URL completa** com protocolo e path.

## 🧪 Testando a Integração

### 1. Acesse sua Aplicação

Vá para a URL do GitHub Pages: `https://seu-usuario.github.io/lerunners-app`

### 2. Crie uma Conta de Atleta

1. Clique em **"Cadastrar"**
2. Preencha os dados
3. Selecione **"Atleta"** como tipo de usuário
4. Clique em **"Criar conta"**

### 3. Teste a Conexão Strava

1. No dashboard do atleta, vá para a aba **"Strava"**
2. Clique em **"Conectar com Strava"**
3. Você deve ser redirecionado para o Strava
4. Autorize a aplicação
5. Deve retornar para o LeRunners com sucesso

## 🐛 Solução de Problemas

### Erro: "Invalid redirect_uri"

**Causa**: Authorization Callback Domain incorreto

**Solução**:
1. Verifique se o domínio está correto (sem https:// e sem path)
2. Aguarde alguns minutos após salvar (pode haver cache)

### Erro: "Application not found"

**Causa**: Client ID incorreto ou aplicação não existe

**Solução**:
1. Verifique o Client ID no arquivo `src/lib/strava.js`
2. Confirme se a aplicação existe no portal Strava

### Erro de CORS

**Causa**: Website URL incorreto

**Solução**:
1. Verifique se a URL completa está correta
2. Certifique-se de usar HTTPS

### Aplicação não carrega após autorização

**Causa**: Configuração do base path no Vite

**Solução**:
1. Verifique se o `base` no `vite.config.js` está correto
2. Deve ser `/nome-do-repositorio/`

## 📝 Checklist de Verificação

Antes de testar, confirme:

- [ ] Website URL: `https://seu-usuario.github.io/lerunners-app`
- [ ] Authorization Callback Domain: `seu-usuario.github.io`
- [ ] Client ID correto no código
- [ ] Client Secret correto no código
- [ ] Aplicação salva no Strava
- [ ] GitHub Pages funcionando
- [ ] HTTPS habilitado

## 🔄 Atualizando Credenciais

Se você precisar atualizar o Client ID ou Client Secret:

1. **Edite o arquivo**: `src/lib/strava.js`
2. **Localize a seção**:
```javascript
export const STRAVA_CONFIG = {
  clientId: "SEU_CLIENT_ID_AQUI",
  clientSecret: "SEU_CLIENT_SECRET_AQUI",
  // ...
};
```
3. **Substitua os valores**
4. **Faça commit e push**:
```bash
git add .
git commit -m "Update Strava credentials"
git push origin main
```
5. **Aguarde o deploy automático** (2-3 minutos)

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique o Console do navegador (F12) para erros
2. Confirme se todas as URLs estão corretas
3. Teste com uma conta Strava diferente
4. Aguarde alguns minutos entre mudanças (cache do Strava)

---

**Lembre-se**: Mudanças no Strava podem levar alguns minutos para fazer efeito devido ao cache.
