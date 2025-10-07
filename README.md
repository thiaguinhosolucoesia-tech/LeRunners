# LeRunners - Plataforma de Gestão de Atletas

Uma aplicação web moderna para gestão de atletas e treinamentos, com integração completa ao Strava API e Firebase.

## 🏃‍♂️ Sobre o Projeto

O **LeRunners** é uma plataforma desenvolvida para facilitar a gestão de atletas por parte de treinadores e professores de corrida. A aplicação permite que professores acompanhem o progresso de seus atletas através da integração com o Strava, definam objetivos personalizados e monitorem o desempenho em tempo real.

### Funcionalidades Principais

#### Para Professores/Treinadores:
- **Dashboard Completo**: Visão geral de todos os atletas cadastrados
- **Gestão de Atletas**: Adicionar, editar e remover atletas
- **Definição de Objetivos**: Configurar metas semanais e provas alvo para cada atleta
- **Monitoramento Strava**: Acompanhar atividades sincronizadas automaticamente
- **Relatórios de Progresso**: Visualizar estatísticas e evolução dos atletas

#### Para Atletas:
- **Dashboard Personalizado**: Visão das próprias atividades e progresso
- **Integração Strava**: Conexão automática com conta Strava para sincronização de treinos
- **Acompanhamento de Objetivos**: Visualizar metas definidas pelo treinador
- **Progresso Semanal**: Gráficos e métricas de evolução
- **Histórico de Atividades**: Lista completa de treinos e corridas

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Autenticação**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **API Externa**: Strava API v3
- **Ícones**: Lucide React
- **Gerenciador de Pacotes**: pnpm

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (versão 18 ou superior)
- pnpm (ou npm/yarn)
- Conta Firebase
- Conta Strava Developer

## ⚙️ Configuração

### 1. Firebase Setup

1. Acesse o [Console Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use o existente
3. Ative o **Authentication** com Email/Password
4. Ative o **Realtime Database**
5. Configure as regras de segurança:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "athletes": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

6. Obtenha as credenciais do projeto em **Configurações do Projeto > Geral > Seus apps**

### 2. Strava API Setup

1. Acesse [Strava Developers](https://developers.strava.com/)
2. Crie uma nova aplicação em **My API Application**
3. Configure os campos:
   - **Application Name**: LeRunners App
   - **Website**: URL do seu site (ex: https://seu-usuario.github.io/lerunners-app)
   - **Authorization Callback Domain**: mesmo domínio do website
4. Anote o **Client ID** e **Client Secret**

### 3. Configuração do Projeto

As credenciais já estão configuradas no arquivo `src/lib/firebase.js` e `src/lib/strava.js` com os valores fornecidos:

**Firebase Config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAvNlifcwHV6qPh9cKCJTQoJM2bMkGl2HQ",
  authDomain: "lerunners-4725f.firebaseapp.com",
  databaseURL: "https://lerunners-4725f-default-rtdb.firebaseio.com",
  projectId: "lerunners-4725f",
  storageBucket: "lerunners-4725f.firebasestorage.app",
  messagingSenderId: "490740324975",
  appId: "1:490740324975:web:c354dcdcd334c049a58b9a"
};
```

**Strava Config:**
```javascript
export const STRAVA_CONFIG = {
  clientId: "180023",
  clientSecret: "b9e9c18254fe229af3a7e95a995c0c94b22d41ff",
  // ... outras configurações
};
```

## 🛠️ Instalação e Execução

### Desenvolvimento Local

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/lerunners-app.git
cd lerunners-app
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
pnpm run dev
```

4. **Acesse a aplicação:**
Abra [http://localhost:5173](http://localhost:5173) no seu navegador

### Build para Produção

```bash
pnpm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🌐 Deploy no GitHub Pages

### Configuração Automática

1. **Faça push do código para o GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Configure GitHub Pages:**
   - Vá para **Settings > Pages** no seu repositório
   - Selecione **Source**: GitHub Actions
   - O workflow será executado automaticamente

3. **Atualize a configuração do Strava:**
   - Acesse [Strava Developers](https://developers.strava.com/)
   - Edite sua aplicação
   - Atualize o **Website** para: `https://seu-usuario.github.io/lerunners-app`
   - Atualize o **Authorization Callback Domain** para: `seu-usuario.github.io`

### Configuração Manual

Se preferir configurar manualmente, adicione este arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Build
      run: pnpm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 📱 Como Usar

### Para Professores/Treinadores:

1. **Cadastro**: Crie uma conta selecionando "Professor" no tipo de usuário
2. **Adicionar Atletas**: Use o botão "Adicionar Atleta" no dashboard
3. **Definir Objetivos**: Clique em "Objetivos" no card de cada atleta
4. **Monitorar Progresso**: Acompanhe as estatísticas na aba "Visão Geral"

### Para Atletas:

1. **Cadastro**: Crie uma conta selecionando "Atleta" no tipo de usuário
2. **Conectar Strava**: Vá para a aba "Strava" e clique em "Conectar com Strava"
3. **Autorizar**: Complete o processo de autorização no Strava
4. **Acompanhar**: Visualize suas atividades e progresso no dashboard

## 🔧 Estrutura do Projeto

```
lerunners-app/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── Login.jsx      # Tela de login/cadastro
│   │   ├── AtletaDashboard.jsx    # Dashboard do atleta
│   │   └── ProfessorDashboard.jsx # Dashboard do professor
│   ├── lib/               # Configurações e utilitários
│   │   ├── firebase.js    # Configuração Firebase
│   │   └── strava.js      # Configuração Strava API
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Ponto de entrada
├── package.json          # Dependências do projeto
└── README.md            # Este arquivo
```

## 🔐 Segurança

### Considerações Importantes:

1. **Client Secret**: Em produção, o `clientSecret` do Strava deve ser movido para um backend seguro
2. **Regras Firebase**: Configure regras mais restritivas para produção
3. **HTTPS**: Sempre use HTTPS em produção
4. **Validação**: Implemente validação adicional no backend

### Regras Firebase Recomendadas para Produção:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "athletes": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.uid === data.child('professorId').val() || auth.uid === $athleteId)"
    }
  }
}
```

## 🐛 Solução de Problemas

### Problemas Comuns:

1. **Erro de CORS no Strava**: Verifique se o domínio está configurado corretamente na aplicação Strava
2. **Firebase não conecta**: Confirme se as credenciais estão corretas em `firebase.js`
3. **Build falha**: Execute `pnpm install` novamente e verifique as dependências

### Logs e Debug:

- Abra o Console do Navegador (F12) para ver erros JavaScript
- Verifique o Console Firebase para erros de autenticação
- Use o Network tab para debugar chamadas API

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:

- **Email**: contato@lerunners.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/lerunners-app/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/lerunners-app/wiki)

---

**Desenvolvido com ❤️ para a comunidade de corrida**
