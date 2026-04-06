const { execSync } = require('child_process');

console.log('🚀 Starting production server...');

// Executar migrations
try {
  console.log('📊 Running database migrations...');
  execSync('npm run typeorm migration:run -- -d dist/src/config/data-source.js', {
    stdio: 'inherit',
  });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.warn('⚠️  Migration failed or no migrations to run:', error.message);
  // Continua mesmo se migrations falharem (pode já estar rodado)
}

// Executar seed apenas se a variável RUN_SEED estiver definida
if (process.env.RUN_SEED === 'true') {
  try {
    console.log('🌱 Running database seed...');
    execSync('node dist/src/database/seeds/seed.js', {
      stdio: 'inherit',
    });
    console.log('✅ Seed completed successfully');
  } catch (error) {
    console.warn('⚠️  Seed failed:', error.message);
    // Continua mesmo se seed falhar
  }
}

// Iniciar aplicação
console.log('🎯 Starting NestJS application...');
try {
  execSync('node dist/src/main.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
}
