# === ESTÁGIO 1: Compilação (Build) ===
FROM node:20-alpine AS build

WORKDIR /app

# Copia os arquivos de mapeamento de dependências
COPY package*.json tsconfig.json ./

# Instala todas as dependências (incluindo as de desenvolvimento)
RUN npm ci

# Copia o código fonte e os testes
COPY src/ ./src
COPY tests/ ./tests

# Compila o TypeScript em JavaScript (gera a pasta /dist)
RUN npm run build

# Remove as dependências de desenvolvimento para aliviar o container final
RUN npm prune --production

# === ESTÁGIO 2: Execução em Produção ===
FROM node:20-alpine AS production

WORKDIR /app

# Cria um nó de ambiente focado em produção
ENV NODE_ENV=production

# Copia apenas o que é estritamente necessário do estágio anterior
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Expõe a porta interna do container (padrão 3000)
EXPOSE 3000

# Comando para iniciar a aplicação direto pelo JavaScript compilado
CMD ["node", "dist/src/server.js"]