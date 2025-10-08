# LeRunners - Plataforma de Gestão de Atletas

Bem-vindo à versão estável e refatorada da plataforma LeRunners. A arquitetura foi reestruturada para máxima estabilidade e para incorporar o uso profissional de Cloudinary para arquivos e fotos.

## Ação Obrigatória: Configuração Inicial (3 Passos)

Siga estes 3 passos para garantir 100% de funcionalidade.

### Passo 1: Configurar o Cloudinary (Para Fotos e Arquivos JSON)

A plataforma agora depende do Cloudinary para armazenar todas as imagens e arquivos. O plano gratuito é suficiente.

1.  **Crie uma conta gratuita** em [cloudinary.com](https://cloudinary.com/).
2.  No seu **Dashboard**, encontre e anote seu **`Cloud Name`** e **`API Key`**.
3.  Vá para **Settings** (⚙️) > **Upload**.
4.  Role até **Upload presets**, clique em **"Add upload preset"**.
5.  Altere o **Signing Mode** de `Signed` para `Unsigned`.
6.  Anote o **nome do seu upload preset** (ex: `lerunners_unsigned`).
7.  **Ação Final:** Abra o arquivo `js/config.js` e preencha o objeto `CLOUDINARY_CONFIG` com os 3 valores que você anotou.

### Passo 2: Configurar o Firebase Authentication

1.  Acesse o **Console Firebase** > seu projeto (`lerunners-4725f`).
2.  Vá em **Build > Authentication > Sign-in method**.
3.  **Habilite** a opção **Email/Password** e salve.

### Passo 3: Regras do Realtime Database (Correção Definitiva do Erro `PERMISSION_DENIED`)

Estas são as regras corretas que permitem a um administrador criar e gerenciar outros usuários.

1.  No Console do Firebase, vá em **Build > Realtime Database > Rules**.
2.  Substitua todo o conteúdo por estas regras e clique em **Publish**:
    ```json
    {
      "rules": {
        "users": {
          ".read": "auth != null",
          "$uid": {
            // Permite que o próprio usuário OU um admin escreva nos seus dados
            ".write": "$uid === auth.uid || root.child('users/' + auth.uid).child('type').val() === 'admin'"
          }
        },
        "knowledge": {
          ".read": "auth != null",
          // Apenas admins podem escrever no "Cérebro Inteligente"
          ".write": "root.child('users/' + auth.uid).child('type').val() === 'admin'"
        }
      }
    }
    ```

**Pronto!** A plataforma está configurada para funcionar de forma estável.

## Credenciais de Admin

* **Email:** `thi@g.com`
* **Senha:** `194000`
