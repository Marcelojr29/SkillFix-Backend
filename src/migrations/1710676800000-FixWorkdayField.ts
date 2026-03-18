import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixWorkdayField1710676800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Passo 1: Criar coluna temporária
    await queryRunner.query(`
      ALTER TABLE "tecnicos" 
      ADD COLUMN "workday_temp" VARCHAR
    `);

    // Passo 2: Copiar dados existentes e gerar matrículas automáticas
    // Como workday atual tem valores '1T', '2T', '3T', 'ADM', vamos gerar
    // matrículas automáticas baseadas no ID
    await queryRunner.query(`
      UPDATE "tecnicos" 
      SET "workday_temp" = CONCAT('MAT', LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "createdAt") AS VARCHAR), 5, '0'))
    `);

    // Passo 3: Remover coluna antiga
    await queryRunner.query(`
      ALTER TABLE "tecnicos" 
      DROP COLUMN "workday"
    `);

    // Passo 4: Renomear coluna temporária
    await queryRunner.query(`
      ALTER TABLE "tecnicos" 
      RENAME COLUMN "workday_temp" TO "workday"
    `);

    // Passo 5: Adicionar constraint NOT NULL
    await queryRunner.query(`
      ALTER TABLE "tecnicos" 
      ALTER COLUMN "workday" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter para o tipo anterior (mantém como VARCHAR para não perder dados)
    // Nota: Não é possível recuperar os valores originais do enum automaticamente
    console.log('Revertendo migration FixWorkdayField');
    console.log('Atenção: Os valores originais do enum não podem ser recuperados automaticamente');
  }
}
