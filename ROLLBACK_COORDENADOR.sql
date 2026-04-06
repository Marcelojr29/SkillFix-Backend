-- ============================================
-- ROLLBACK: Coordenador Múltiplos Sub-times
-- ============================================
-- Execute este script no seu cliente PostgreSQL (DBeaver, pgAdmin, etc.)
-- para desfazer TODAS as mudanças no banco de dados

-- 1. Deletar tabela coordenador_led_subtimes
DROP TABLE IF EXISTS "coordenador_led_subtimes" CASCADE;

-- 2. Remover registros de migrations executadas
DELETE FROM migrations 
WHERE name IN (
  'AddCoordenadorRole1743706800000',
  'UpdateCoordenadorToMultipleSubtimes1743800000000'
);

-- 3. Verificar se tudo foi removido
SELECT COUNT(*) as "Tabelas coordenador_led_subtimes restantes"
FROM information_schema.tables 
WHERE table_name = 'coordenador_led_subtimes';
-- Deve retornar 0

SELECT COUNT(*) as "Migrations de coordenador restantes"
FROM migrations
WHERE name LIKE '%Coordenador%';
-- Deve retornar 0

-- ✅ PRONTO! Após executar este script:
-- 1. Reinicie o backend: npm run start:dev
-- 2. O sistema voltará ao estado anterior
-- 3. Coordenador terá apenas UM sub-time (led_subtime_id)
