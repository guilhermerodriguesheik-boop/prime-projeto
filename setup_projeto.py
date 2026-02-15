
import os

# Estrutura do projeto PRIME GROUP
files = {
    "index.html": """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>PRIME GROUP - Gestão Operacional</title>
    <meta name="theme-color" content="#020617">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        @media print { .no-print { display: none !important; } body { background: white; color: black; } }
    </style>
</head>
<body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
</body>
</html>""",
    "package.json": """{
  "name": "prime-group-gestao",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.12.7",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.2.2",
    "vite": "^5.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4"
  }
}""",
    "vite.config.ts": """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });""",
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false
  },
  "include": ["**/*.ts", "**/*.tsx"]
}""",
    "LEAME.md": """# PRIME GROUP - Gestão Operacional

Este é o projeto exportado. Para rodar em seu computador:

1. Certifique-se de ter o **Node.js** instalado.
2. Abra o terminal na pasta do projeto.
3. Instale as dependências: `npm install`
4. Rode o projeto: `npm run dev`
5. Acesse no navegador: `http://localhost:5173`

O projeto está em modo **Offline** (salva no LocalStorage do navegador).""",
}

# Lista de arquivos para criar pastas automaticamente (se necessário)
# (Nota: O script de criação abaixo cuida de pastas simples)

def create_files():
    print("🚀 Iniciando reconstrução do projeto PRIME GROUP...")
    for path, content in files.items():
        folder = os.path.dirname(path)
        if folder and not os.path.exists(folder):
            os.makedirs(folder)
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Criado: {path}")
    
    print("\n✅ Projeto reconstruído com sucesso!")
    print("👉 Agora execute: npm install && npm run dev")

if __name__ == "__main__":
    create_files()
