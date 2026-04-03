import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTasksTable1775217374693 implements MigrationInterface {
  private readonly logger = new Logger(CreateTasksTable1775217374693.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isPrimary: true,
          },
          {
            name: 'title',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'BACKLOG',
              'TODO',
              'IN_PROGRESS',
              'IN_REVIEW',
              'QA',
              'DONE',
              'REOPENED',
            ],
            default: "'BACKLOG'",
            isNullable: false,
          },
          {
            name: 'projectId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'assigneeId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdById',
            type: 'uuid',
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
            columnNames: ['projectId'],
            referencedTableName: 'projects',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['assigneeId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['createdById'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    const tasks = [
      // TaskForge Development Project Tasks
      {
        id: 'd0e1f3a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        title: 'Setup database schema',
        description: 'Create initial database migrations and entities',
        status: 'DONE',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        assigneeId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        createdById: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        priority: 'HIGH',
        storyPoints: 5,
      },
      {
        id: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1b2d3e4f4b',
        title: 'Implement JWT authentication',
        description: 'Create auth service with JWT tokens and refresh mechanism',
        status: 'IN_PROGRESS',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        assigneeId: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        createdById: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        priority: 'URGENT',
        storyPoints: 8,
      },
      {
        id: 'd0e1f2b2-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        title: 'Create task management API',
        description: 'Implement CRUD operations for tasks with RBAC',
        status: 'TODO',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        assigneeId: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        createdById: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        priority: 'HIGH',
        storyPoints: 13,
      },
      {
        id: 'd0b2f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        title: 'Write unit tests for auth service',
        description: 'Achieve 80% code coverage for authentication',
        status: 'IN_REVIEW',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        assigneeId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        createdById: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        priority: 'MEDIUM',
        storyPoints: 5,
      },
      {
        id: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1b2d3b4f4b',
        title: 'Setup Docker configuration',
        description: 'Create Dockerfile and docker-compose for all services',
        status: 'QA',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f4b',
        assigneeId: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        createdById: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        priority: 'HIGH',
        storyPoints: 3,
      },
      
      // Mobile App Launch Tasks
      {
        id: 'd0e1f2a4-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        title: 'Design mobile API endpoints',
        description: 'Create REST API specifications for mobile app',
        status: 'TODO',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        assigneeId: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        createdById: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        priority: 'HIGH',
        storyPoints: 8,
      },
      {
        id: 'd0e1f3b3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        title: 'Implement push notifications',
        description: 'Setup FCM/APNS for push notifications',
        status: 'BACKLOG',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        assigneeId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        createdById: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        priority: 'MEDIUM',
        storyPoints: 13,
      },
      {
        id: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f3b',
        title: 'Create offline sync mechanism',
        description: 'Implement data synchronization for offline usage',
        status: 'TODO',
        projectId: 'd0e1f2a3-4b5c-6d7e-8f5b-0b1c2d3e4f5a',
        assigneeId: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        createdById: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        priority: 'LOW',
        storyPoints: 21,
      },]

      for (const task of tasks) {
      await queryRunner.query(
        `
        INSERT INTO "tasks" (
          "id", "title", "description", "status", "projectId", "assigneeId", "createdById",
           "createdAt", "updatedAt"
        ) VALUES (
          '${task.id}',
          '${task.title}',
          '${task.description}',
          '${task.status}',
          '${task.projectId}',
          '${task.assigneeId}',
          '${task.createdById}',
          NOW(),
          NOW()
        )
      `,
      );
    }

    this.logger.log('Tasks table created and seeded with 13 tasks');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Dropping tasks table');
    await queryRunner.dropTable('tasks');
  }
}
