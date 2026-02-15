
# 🚛 PRIME GROUP - Instruções para Rodar Localmente

Este projeto foi desenvolvido para funcionar como um Web App (PWA) e está configurado para rodar localmente com **Vite** e **React**.

## 📋 Pré-requisitos
- **Node.js** (v18 ou superior) instalado no seu computador.
- Um editor de código (como o **VS Code**).

## 🚀 Como Iniciar

1. **Extraia os arquivos**: Se você usou o script `setup_projeto.py`, os arquivos já estarão na pasta.
2. **Abra o Terminal**: Navegue até a pasta do projeto.
3. **Instale as dependências**:
   ```bash
   npm install
   ```
4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
5. **Acesse o App**: O terminal mostrará um link (geralmente `http://localhost:5173`). Abra-o no seu navegador.

## 📱 Transformando em App de Celular (APK)
Este projeto usa a estrutura compatível com **Capacitor**. Para gerar um APK:
1. Instale o Capacitor: `npm install @capacitor/core @capacitor/cli @capacitor/android`
2. Inicialize: `npx cap init`
3. Adicione o Android: `npx cap add android`
4. Gere o build: `npm run build`
5. Sincronize: `npx cap copy`
6. Abra no Android Studio: `npx cap open android`

## 💾 Armazenamento
Os dados estão sendo salvos no **LocalStorage** do seu navegador. Se você limpar o cache do navegador, os dados serão perdidos. Para um uso profissional em larga escala, recomenda-se reconectar o banco de dados **Supabase**.
