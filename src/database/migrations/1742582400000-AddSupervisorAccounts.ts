import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupervisorAccounts1742582400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Adicionar colunas em tecnicos (com verificação)
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='tecnicos' AND column_name='email'
        ) THEN
          ALTER TABLE tecnicos ADD COLUMN email VARCHAR(255) NULL UNIQUE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='tecnicos' AND column_name='has_user_account'
        ) THEN
          ALTER TABLE tecnicos ADD COLUMN has_user_account BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);

    // 2. Adicionar coluna em users (com verificação)
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='tecnico_id'
        ) THEN
          ALTER TABLE users ADD COLUMN tecnico_id UUID NULL;
        END IF;
      END $$;
    `);

    // 3. Criar foreign key (com verificação)
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name='fk_users_tecnico'
        ) THEN
          ALTER TABLE users 
          ADD CONSTRAINT fk_users_tecnico 
          FOREIGN KEY (tecnico_id) 
          REFERENCES tecnicos(id) 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 4. Criar índice (com verificação)
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname='idx_users_tecnico_id'
        ) THEN
          CREATE INDEX idx_users_tecnico_id ON users(tecnico_id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_tecnico_id;`);
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_tecnico;`,
    );
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS tecnico_id;`);
    await queryRunner.query(
      `ALTER TABLE tecnicos DROP COLUMN IF EXISTS has_user_account;`,
    );
    await queryRunner.query(`ALTER TABLE tecnicos DROP COLUMN IF EXISTS email;`);
  }
}
