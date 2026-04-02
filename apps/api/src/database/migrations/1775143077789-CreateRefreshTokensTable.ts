import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRefreshTokensTable1775143077789 implements MigrationInterface {
  private readonly logger = new Logger(
    CreateRefreshTokensTable1775143077789.name,
  );

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
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
            name: 'token',
            type: 'text',
            isNullable: false,
            isUnique: true,
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
      INSERT INTO "refresh_tokens" (
        "id", 
        "userId", 
        "token", 
        "expireAt", 
        "createdAt", 
        "updatedAt"
      )
      VALUES 
      (
        'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
        'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDg2NDAwfQ.example_token_1',
        NOW() + INTERVAL '7 days',
        NOW(),
        NOW()
      ),
      (
        'e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWlkZTEiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDA4NjQwMH0.example_token_2',
        NOW() + INTERVAL '7 days',
        NOW(),
        NOW()
      ),
      (
        'f2a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
        'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGllbnQxIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwODY0MDB9.example_token_3',
        NOW() + INTERVAL '7 days',
        NOW(),
        NOW()
      )
    `);
    this.logger.log('Refresh tokens table created and seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Dropping refresh_tokens table');
    await queryRunner.dropTable('refresh_tokens');
  }
}
