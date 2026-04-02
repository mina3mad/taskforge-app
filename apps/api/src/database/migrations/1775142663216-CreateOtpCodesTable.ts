import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOtpCodesTable1775142663216 implements MigrationInterface {
  private readonly logger = new Logger(CreateOtpCodesTable1775142663216.name);
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'otp_codes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '6',
            // isUnique: true,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['SignUp', 'ForgetPassword'],
            isNullable: false,
          },
          {
            name: 'state',
            type: 'enum',
            enum: ['Generated', 'Used'],
            default: "'Generated'",
          },
          {
            name: 'expireAt',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.query(`
      INSERT INTO "otp_codes" ("id", "userId", "code", "type", "expireAt", "createdAt")
      VALUES 
      (
        'f7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
        'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        '123456',
        'SignUp',
        NOW() + INTERVAL '5 minutes',
        NOW()
      ),
      (
        'b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 
        '789012',
        'ForgetPassword',
        NOW() + INTERVAL '5 minutes',
        NOW()
      ),
      (
        'c9d0e1f2-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
        'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27', 
        '345678',
        'SignUp',
        NOW() + INTERVAL '5 minutes',
        NOW()
      )
    `);
    this.logger.log('otp_codes table created and seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Dropping otp_codes table');
    await queryRunner.dropTable('otp_codes');
  }
}
