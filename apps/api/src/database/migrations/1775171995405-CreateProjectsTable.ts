import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProjectsTable1775171995405 implements MigrationInterface {
  private readonly logger = new Logger(CreateProjectsTable1775171995405.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar(100)',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ownerId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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
            columnNames: ['ownerId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    const projects = [
      {
        id: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        name: 'TaskForge Development',
        description: 'Main development project for TaskForge platform',
        ownerId: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27', // Admin
      },
      {
        id: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        name: 'Mobile App Launch',
        description: 'Developing and launching mobile application',
        ownerId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', // PM
      },
      {
        id: 'd0e1f2a3-4b5c-6b4e-8f9a-0b1c2d3e4f5a',
        name: 'backend task',
        description: 'Implementing backend task',
        ownerId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', // PM
      },
    ];
    for (const project of projects) {
      await queryRunner.query(
        `
        INSERT INTO "projects" (
          "id", "name", "description", "ownerId", "createdAt", "updatedAt"
        ) VALUES (
          '${project.id}', 
          '${project.name}', 
          '${project.description}', 
          '${project.ownerId}', 
          NOW(), 
          NOW()
        )
      `,
      );
    }

    this.logger.log('Projects table created and seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Dropping projects table');
    await queryRunner.dropTable('projects');
  }
}
