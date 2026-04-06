# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev && npm cache clean --force

# Copiar arquivos compilados
COPY --from=builder /app/dist ./dist

# Copiar arquivos necessários para migrations e TypeORM
COPY --from=builder /app/src/database ./src/database
COPY --from=builder /app/src/config ./src/config
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/nest-cli.json ./nest-cli.json

# Criar diretório de uploads
RUN mkdir -p uploads/photos

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/src/main.js"]
