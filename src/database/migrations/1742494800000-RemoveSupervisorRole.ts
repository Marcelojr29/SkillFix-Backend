import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSupervisorRole1742494800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Atualizar todos os usuários com role 'supervisor' para 'master'
    await queryRunner.query(`
      UPDATE users 
      SET role = 'master' 
      WHERE role = 'supervisor';
    `);

    // 2. Remover o default temporariamente
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role DROP DEFAULT;
    `);

    // 3. Criar um novo enum sem o valor 'supervisor'
    await queryRunner.query(`
      CREATE TYPE users_role_enum_new AS ENUM ('master');
    `);

    // 4. Alterar a coluna para usar o novo enum
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE users_role_enum_new 
      USING role::text::users_role_enum_new;
    `);

    // 5. Remover o enum antigo
    await queryRunner.query(`
      DROP TYPE users_role_enum;
    `);

    // 6. Renomear o novo enum
    await queryRunner.query(`
      ALTER TYPE users_role_enum_new RENAME TO users_role_enum;
    `);

    // 7. Restaurar o default da coluna
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role SET DEFAULT 'master'::users_role_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Recriar o enum com 'supervisor'
    await queryRunner.query(`
      CREATE TYPE users_role_enum_new AS ENUM ('master', 'supervisor');
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE users_role_enum_new 
      USING role::text::users_role_enum_new;
    `);

    await queryRunner.query(`
      DROP TYPE users_role_enum;
    `);

    await queryRunner.query(`
      ALTER TYPE users_role_enum_new RENAME TO users_role_enum;
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role SET DEFAULT 'supervisor';
    `);
  }
}
