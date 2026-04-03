import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProjectMembersTable1775172870842 implements MigrationInterface {
  private readonly logger = new Logger(
    CreateProjectMembersTable1775172870842.name,
  );
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'project_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isPrimary: true,
          },
          {
            name: 'projectId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'joinedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
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
          {
            columnNames: ['projectId'],
            referencedTableName: 'projects',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        uniques: [
          {
            name: 'UQ_project_user',
            columnNames: ['projectId', 'userId'],
          },
        ],
      }),
    );
    const projectMembers = [
      // TaskForge Development project members
      {
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        userId: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      },
      {
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        userId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      },
      {
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        userId: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      },

      // Mobile App Launch members
      {
        projectId: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        userId: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      },
      {
        projectId: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        userId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      },
      {
        projectId: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        userId: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      },
    ];
    for (const member of projectMembers) {
      await queryRunner.query(
        `
        INSERT INTO "project_members" ("projectId", "userId", "joinedAt")
        VALUES ( '${member.projectId}', 
          '${member.userId}', NOW())
      `,
      );
    }

    this.logger.log('Project members table created and seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Dropping project members table');
    await queryRunner.dropTable('project_members');
  }
}
