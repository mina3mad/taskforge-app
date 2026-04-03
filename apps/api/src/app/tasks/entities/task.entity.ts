import { BaseEntity } from 'src/shared/base.entity';
import { User } from 'src/app/users/entities/user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TaskStatus } from '../enum/task-status.enum';
import { Project } from 'src/app/projects/entities/project.entity';
 
@Entity({ name: 'tasks' })
export class Task extends BaseEntity {
  @Column({ nullable: false })
  title: string;
 
  @Column({ nullable: true, type: 'text' })
  description: string;
 
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.BACKLOG,
  })
  status: TaskStatus;
 
  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;
 
  @Column({ nullable: false })
  projectId: string;
 
  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User;
 
  @Column({ nullable: true })
  assigneeId: string;
 
  @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
 
  @Column({ nullable: false })
  createdById: string;
}