import { Logger } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1775141672953 implements MigrationInterface {
  private readonly logger = new Logger(CreateUsersTable1775141672953.name);
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isPrimary: true,
          },
          {
            name: 'email',
            type: 'varchar(100)',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'firstName',
            type: 'varchar(50)',
            isNullable: false,
          },
          {
            name: 'lastName',
            type: 'varchar(50)',
            isNullable: false,
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['Male', 'Female', 'PreferNotToSay'],
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['ADMIN', 'PROJECT_MANAGER', 'MEMBER', 'QA'],
            default: "'MEMBER'",
            isNullable: false,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
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
      }),
    );

    //Seed users with multiple roles
    const users = [
      {
        id: 'd7d0411e-4d70-47ad-b79a-74f0c9fbfe27',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'Admin',
        gender: 'Male',
        password: 'Admin@123',
        role: 'ADMIN',
      },
      {
        id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        email: 'mina@example.com',
        firstName: 'Mina',
        lastName: 'Member',
        gender: 'Male',
        password: 'Mina@123',
        role: 'MEMBER',
      },
      {
        id: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Doe',
        gender: 'Female',
        password: 'sarah@456',
        role: 'PROJECT_MANAGER',
      },
      {
        id: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        email: 'youseef@example.com',
        firstName: 'Youseef',
        lastName: 'Ali',
        gender: 'Male',
        password: 'youssef@123',
        role: 'QA',
      },
    ];
    for (const user of users) {
      const hashedPassword = hashSync(user.password, 10);
      await queryRunner.query(`
            INSERT INTO "users" (
          "id", "email","firstName", "lastName", "gender", "password", "role","isVerified" 
          "createdAt", "updatedAt"
        ) VALUES (
          '${user.id}', 
          '${user.email}', 
          '${user.firstName}', 
          '${user.lastName}', 
          '${user.gender}', 
          '${hashedPassword}', 
          '${user.role}',
          '${true}',
          NOW(), 
          NOW()
        )
            `);
    }
    this.logger.log('users table created and seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Droping users table');
    await queryRunner.dropTable('users');
  }
}
