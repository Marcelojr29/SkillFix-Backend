import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToEntities1743000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar created_by em teams
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='teams' AND column_name='created_by'
        ) THEN
          ALTER TABLE teams ADD COLUMN created_by UUID NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE teams 
      ADD CONSTRAINT fk_teams_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL;
    `);

    // Adicionar created_by em tecnicos
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='tecnicos' AND column_name='created_by'
        ) THEN
          ALTER TABLE tecnicos ADD COLUMN created_by UUID NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE tecnicos 
      ADD CONSTRAINT fk_tecnicos_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL;
    `);

    // Adicionar created_by em subtimes
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='subtimes' AND column_name='created_by'
        ) THEN
          ALTER TABLE subtimes ADD COLUMN created_by UUID NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE subtimes 
      ADD CONSTRAINT fk_subtimes_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL;
    `);

    // Adicionar created_by em skills
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='skills' AND column_name='created_by'
        ) THEN
          ALTER TABLE skills ADD COLUMN created_by UUID NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE skills 
      ADD CONSTRAINT fk_skills_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL;
    `);

    // Adicionar created_by em machines
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='machines' AND column_name='created_by'
        ) THEN
          ALTER TABLE machines ADD COLUMN created_by UUID NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE machines 
      ADD CONSTRAINT fk_machines_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL;
    `);

    // Adicionar created_by em evaluations
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='evaluations' AND column_name='created_by'
        ) THEN
          ALTER TABLE evaluations ADD COLUMN created_by UUID NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE evaluations 
      ADD CONSTRAINT fk_evaluations_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL;
    `);

    // Adicionar created_by em quarterly_notes
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='quarterly_notes' AND column_name='created_by'
        ) THEN
          ALTER TABLE quarterly_notes ADD COLUMN created_by UUID NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE quarterly_notes 
      ADD CONSTRAINT fk_quarterly_notes_created_by 
      FOREIGN KEY (created_by) REFERENCES users(id) 
      ON DELETE SET NULL;
    `);

    // Criar índices para performance
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tecnicos_created_by ON tecnicos(created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subtimes_created_by ON subtimes(created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_skills_created_by ON skills(created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_machines_created_by ON machines(created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_evaluations_created_by ON evaluations(created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_quarterly_notes_created_by ON quarterly_notes(created_by);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_teams_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tecnicos_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subtimes_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skills_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_machines_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_evaluations_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quarterly_notes_created_by;`);

    // Remover constraints e colunas
    await queryRunner.query(`ALTER TABLE teams DROP CONSTRAINT IF EXISTS fk_teams_created_by;`);
    await queryRunner.query(`ALTER TABLE teams DROP COLUMN IF EXISTS created_by;`);

    await queryRunner.query(`ALTER TABLE tecnicos DROP CONSTRAINT IF EXISTS fk_tecnicos_created_by;`);
    await queryRunner.query(`ALTER TABLE tecnicos DROP COLUMN IF EXISTS created_by;`);

    await queryRunner.query(`ALTER TABLE subtimes DROP CONSTRAINT IF EXISTS fk_subtimes_created_by;`);
    await queryRunner.query(`ALTER TABLE subtimes DROP COLUMN IF EXISTS created_by;`);

    await queryRunner.query(`ALTER TABLE skills DROP CONSTRAINT IF EXISTS fk_skills_created_by;`);
    await queryRunner.query(`ALTER TABLE skills DROP COLUMN IF EXISTS created_by;`);

    await queryRunner.query(`ALTER TABLE machines DROP CONSTRAINT IF EXISTS fk_machines_created_by;`);
    await queryRunner.query(`ALTER TABLE machines DROP COLUMN IF EXISTS created_by;`);

    await queryRunner.query(`ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS fk_evaluations_created_by;`);
    await queryRunner.query(`ALTER TABLE evaluations DROP COLUMN IF EXISTS created_by;`);

    await queryRunner.query(`ALTER TABLE quarterly_notes DROP CONSTRAINT IF EXISTS fk_quarterly_notes_created_by;`);
    await queryRunner.query(`ALTER TABLE quarterly_notes DROP COLUMN IF EXISTS created_by;`);
  }
}
