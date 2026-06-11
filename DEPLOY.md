# Guia Avançado de Publicação: MR Empreendimentos Elite

Este guia detalha o passo a passo completo para exportar, configurar, construir e publicar a sua plataforma **MR Empreendimentos Elite** (Express + React + Vite) em qualquer provedor de hospedagem externa da sua escolha.

---

## 🏗️ 1. Estrutura de Arquitetura do App

A sua aplicação é **Full-Stack**, estruturada da seguinte forma:
- **Frontend**: Single Page Application (SPA) de alta performance construído com **React 19**, **Vite** e estilizado com **Tailwind CSS**.
- **Backend**: Servidor corporativo construído com **Express (Node.js)** e **TypeScript** que fornece rotas protegidas de API, persistência local de dados e proxy seguro para o assessores de Inteligência Artificial da Gemini.
- **Banco de Dados Local**: Sistema de persistência local altamente resiliente que salva usuários e agendamentos estruturados na pasta `/database` (`users.json` e `schedulings.json`). Não requer conexões externas ou servidores SQL auxiliares para iniciar imediatamente, facilitando a portabilidade.

---

## 📂 2. Como Exportar o Código do AI Studio

Para publicar externamente, primeiro obtenha os arquivos de código-fonte completos:
1. No painel superior esquerdo ou no menu de **Configurações (Settings / Export)** do AI Studio Build, clique em **Export to ZIP** (para baixar os arquivos compactados em sua máquina) ou **Export to GitHub** (para criar um repositório sincronizado automaticamente).
2. Se baixou o arquivo `.zip`, descompate-o em uma pasta de trabalho local em seu computador.

---

## 🛠️ 3. Pré-Requisitos no Servidor de Destino

Garanta que o servidor de hospedagem possua instalado:
- **Node.js** (Versão 18.x, 20.x ou superior recomendada)
- **NPM** (Gerenciador de pacotes, incluído nativamente com Node)

---

## 🚀 4. Variáveis de Ambiente (.env)

Crie um arquivo chamado `.env` na raiz do diretório do seu servidor externo e insira as seguintes chaves de configuração:

```env
# Porta de execução do servidor Express (padrão: 3000)
PORT=3000

# Chave oficial do Gemini AI para habilitar o Assistente Virtual inteligente
GEMINI_API_KEY="SUA_CHAVE_DE_API_DO_GEMINI_AQUI"

# URL pública onde o sistema se encontra hospedado (opcional)
APP_URL="https://seu-dominio-elite.com"
```

> **Aviso de Segurança**: Nunca exponha a sua `GEMINI_API_KEY` publicamente. Ao manter as chamadas estruturadas no arquivo de back-end `server.ts`, a sua chave permanece 100% invisível aos clientes acessando o navegador front-end.

---

## ⚙️ 5. Construção para Produção (Build Local ou VPS)

Executar a compilação compila o código-fonte TypeScript e gera os arquivos otimizados e minificados para produção. No terminal do seu projeto, execute os seguintes comandos:

```bash
# 1. Instalar todas as dependências requeridas pelo ecossistema
npm install

# 2. Construir o front-end e empacotar o back-end em dist/server.cjs
npm run build

# 3. Inicializar o servidor corporativo autônomo em produção
npm run start
```

Após o build, a pasta `/dist` conterá:
- Arquivos de front-end estáticos otimizados pelo Vite e Tailwind.
- O arquivo compilado e unificado do backend do Express em `/dist/server.cjs` pronto para escuta acelerada na web.

---

## ☁️ 6. Publicando nas Principais Plataformas

### Opção A: Render, Railway, Fly.io ou Heroku (Hospedagem em Contêineres)
Plataformas sem servidor / baseadas em Git são ideais pelo processo de build automático:

1. **Vincule seu Repositório**: Faça o pushed do seu código para uma conta do GitHub.
2. **Crie um Web Service (Express/Node.js Web App)** na plataforma desejada.
3. **Configure os comandos de Build e Execução**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. **Variáveis de Ambiente**:
   - Defina `NODE_ENV` como `production`.
   - Adicione sua `GEMINI_API_KEY`.
   - *Nota*: A maioria das plataformas injeta automaticamente a variável de ambiente `PORT`, a qual o nosso código irá ler sem necessidade de alteração extra.
5. **Persistência de Dados**:
   - Como essas plataformas têm sistemas de arquivos "efêmeros" (que apagam ao reiniciar ou dar deploy), nós criamos as persistências na pasta `/database`.
   - Se desejar que os dados persistam de forma sólida, configure um **Persistent Volume / Disk** (Disco persistente de cerca de 1GB resolve perfeitamente) montado no caminho operacional `/database`.

---

### Opção B: VPS Tradicional (DigitalOcean, AWS EC2, Linode, Hostinger VPS)
Comandos para execução em sistemas Linux operacionais recomendando `PM2` para manter o aplicativo online 24/7 de forma resiliente:

1. Acesse o seu servidor via terminal SSH:
   ```bash
   ssh root@ip_do_seu_servidor
   ```
2. Clone o código ou transfira os arquivos compactados e instale o Node.js:
   ```bash
   # Instalar Node.js no Ubuntu (exemplo)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Instalar o gerenciador global PM2:
   ```bash
   sudo npm install pm2 -g
   ```
4. Navegue até a pasta da aplicação, instale e construa os ativos:
   ```bash
   npm install
   npm run build
   ```
5. Inicie o servidor Express com PM2 na porta em background:
   ```bash
   pm2 start dist/server.cjs --name "mr-elite-app"
   ```
6. Salve a configuração para restaurar caso o próprio servidor VPS reinicie:
   ```bash
   pm2 save
   pm2 startup
   ```

---

### Opção C: Implantação Automatizada por Docker
Se prefere containerização limpa, você pode colar estes arquivos de configuração prontos para produção:

Crie o arquivo `Dockerfile` na raiz do projeto:
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
# Cria o diretório de dados para manter a persistência
RUN mkdir -p /app/database

EXPOSE 3000
CMD ["npm", "run", "start"]
```

Crie o arquivo `docker-compose.yml` na raiz:
```yaml
version: '3.8'
services:
  mr-elite:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=INSIRA_SUA_CHAVE_DO_GEMINI_AQUI
    volumes:
      # Mantém os dados gravados salvos de forma persistente na máquina física host
      - mr_data:/app/database
    restart: always

volumes:
  mr_data:
```

E para iniciar seu contêiner, simplesmente digite:
```bash
docker-compose up -d --build
```

---

## 💾 7. Migrando para Conexões SQL Corporativas (Opcional)

A nossa persistência via arquivos JSON locais (`/database/*.json`) é excelente para início de baixa escala e testes offline. Para grandes produções corporativas com milhões de clientes concorrentes, você pode facilmente acoplar um banco de dados relacional distribuído.

Exemplo conceitual para acoplar o **PostgreSQL** ou **MySQL** no arquivo `/server.ts`:
1. Instale o driver do banco (EX: `npm install pg @types/pg`).
2. Defina uma Pool de conexão no topo de `server.ts`:
   ```typescript
   import { Pool } from 'pg';
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL, // ex: postgres://user:pwd@host/db
   });
   ```
3. Substitua as leituras de Array (`schedulings.find`) por Query SQL correspondente:
   ```typescript
   // Exemplo:
   app.get("/api/schedulings", async (req, res) => {
     try {
       const result = await pool.query("SELECT * FROM schedulings ORDER BY created_at DESC");
       res.json({ success: true, data: result.rows });
     } catch (err) {
       res.status(500).json({ success: false, error: err.message });
     }
   });
   ```

Aproveite este sistema de alto padrão e engenharia de elite para elevar a MR Empreendimentos ao topo do mercado imobiliário!
