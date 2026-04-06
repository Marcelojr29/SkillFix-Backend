#!/bin/bash

# Script para gerar secrets JWT seguros
# Execute: bash scripts/generate-secrets.sh

echo "🔐 Gerando Secrets JWT Seguros..."
echo ""

echo "JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""

echo "JWT_REFRESH_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""

echo "✅ Secrets gerados com sucesso!"
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Copie estes valores"
echo "2. Configure-os no Render como variáveis de ambiente"
echo "3. NUNCA commite estes valores no repositório"
