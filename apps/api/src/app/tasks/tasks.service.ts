import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UserRole } from '../users/enum/user-role.enum';
import { TaskResponseDto } from './dto/task-response.dto';
import { plainToInstance } from 'class-transformer';
import { Options } from 'src/shared/options.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatus } from './enum/task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly projectsService: ProjectsService,
  ) {}

  async checkProjectExists(projectId: string): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  async checkUserIsMember(
    projectId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<boolean> {
    if (userRole === UserRole.ADMIN) return;
    const isMember = await this.projectsService.isUserMemberOfProject(
      projectId,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }
  }

  canTransition(from: TaskStatus, to: TaskStatus):boolean {
  const allowed = {
    BACKLOG: ['TODO'],
    TODO: ['IN_PROGRESS'],
    IN_PROGRESS: ['IN_REVIEW'],
    IN_REVIEW: ['QA'],
    QA: ['DONE'],
    DONE: ['REOPENED'],
    REOPENED: ['IN_PROGRESS'],
  };

  return allowed[from]?.includes(to);
}

  async create(
    projectId: string,
    createTaskDto: CreateTaskDto,
    userId: string,
    userRole: UserRole,
  ): Promise<TaskResponseDto> {
    await this.checkProjectExists(projectId);
    await this.checkUserIsMember(projectId, userId, userRole);

    // Only ADMIN / PROJECT_MANAGER can assign on creation
    if (
      createTaskDto.assigneeId &&
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.PROJECT_MANAGER
    ) {
      throw new ForbiddenException(
        'Only ADMIN or PROJECT_MANAGER can assign tasks',
      );
    }

    if (createTaskDto.assigneeId) {
      const isMember = await this.projectsService.isUserMemberOfProject(
        projectId,
        createTaskDto.assigneeId,
      );
      if (!isMember) {
        throw new BadRequestException(
          'Assignee must be a member of the project',
        );
      }
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      projectId,
      createdById: userId,
    });

    const saved = await this.taskRepository.save(task);

    return plainToInstance(TaskResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    projectId: string,
    userId: string,
    userRole: UserRole,
    options: Options,
  ): Promise<{ tasks: TaskResponseDto[]; count: number }> {
    await this.checkProjectExists(projectId);
    await this.checkUserIsMember(projectId, userId, userRole);

    const { page, limit, search } = options;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .where('task.projectId = :projectId', { projectId });

    if (search) {
    //   qb.andWhere(`(task.status = :search OR assignee.id = :search)`, {
    //     search,
    //   });
    qb.andWhere(
    `(CAST(task.status AS TEXT) ILIKE :search OR CAST(assignee.email AS TEXT) ILIKE :search)`,
    { search: `%${search}%` },
  );
    }

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    // sorting
    // qb.orderBy('task.createdAt', 'DESC');

    const [tasks, total] = await qb.getManyAndCount();

    return {
      tasks: tasks.map((p) =>
        plainToInstance(TaskResponseDto, p, {
          excludeExtraneousValues: true,
        }),
      ),
      count: total,
    };
  }

  async findOne(
    projectId: string,
    taskId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<TaskResponseDto> {
    await this.checkProjectExists(projectId);
    await this.checkUserIsMember(projectId, userId, userRole);
 
    const task = await this.taskRepository.findOne({
      where: { id: taskId, projectId },
      relations: ['assignee', 'createdBy'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return plainToInstance(TaskResponseDto, task, {
      excludeExtraneousValues: true,
    });
  }

  async updateTitleOrDescription(
    projectId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
    userRole: UserRole,
  ): Promise<TaskResponseDto> {
    await this.checkProjectExists(projectId);
    await this.checkUserIsMember(projectId, userId, userRole);
 
    const task = await this.taskRepository.findOne({
      where: { id: taskId, projectId },
      relations: ['assignee', 'createdBy'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
 
    // MEMBER and QA can only update their own tasks
    if (
      userRole === UserRole.MEMBER ||
      userRole === UserRole.QA
    ) {
      if (task.createdById !== userId) {
        throw new ForbiddenException('You can only update your own tasks');
      }
    }
 
    Object.assign(task, updateTaskDto);
    const saved = await this.taskRepository.save(task);
    return plainToInstance(TaskResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }
 
  async updateStatus(
    projectId: string,
    taskId: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    userId: string,
    userRole: UserRole,
  ): Promise<TaskResponseDto> {
    await this.checkProjectExists(projectId);
    await this.checkUserIsMember(projectId, userId, userRole);
 
    const task = await this.taskRepository.findOne({
      where: { id: taskId, projectId },
      relations: ['assignee', 'createdBy'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const { status: newStatus } = updateTaskStatusDto;
 
    if (task.status === newStatus) {
      throw new BadRequestException(
        `Task is already in ${newStatus} status`,
      );
    }
 
    // ADMIN & PROJECT_MANAGER: can update any task status
    if (
      userRole === UserRole.ADMIN ||
      userRole === UserRole.PROJECT_MANAGER
    ) {
      task.status = newStatus;
      const saved = await this.taskRepository.save(task);
      return plainToInstance(TaskResponseDto, saved, {
      excludeExtraneousValues: true,
    });
    }
 
    // MEMBER & QA: must own the task
    const isOwner =
      task.assigneeId === userId || task.createdById === userId;
 
    if (!isOwner) {
      throw new ForbiddenException(
        'You can only update the status of your own tasks',
      );
    }
 
    // Validate the transition is allowed
    if (!this.canTransition(task.status, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${task.status} to ${newStatus}`,
      );
    }
 
    task.status = newStatus;
    const saved = await this.taskRepository.save(task);
    return plainToInstance(TaskResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }


  async assignTask(
    projectId: string,
    taskId: string,
    assigneeId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<TaskResponseDto> {
    await this.checkProjectExists(projectId);
    await this.checkUserIsMember(projectId, userId, userRole);
 
    // Only ADMIN or PROJECT_MANAGER can assign
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.PROJECT_MANAGER
    ) {
      throw new ForbiddenException(
        'Only ADMIN or PROJECT_MANAGER can assign tasks',
      );
    }
 
    // PROJECT_MANAGER must own the project
    // if (userRole === UserRole.PROJECT_MANAGER) {
    //   const project = await this.projectRepository.findOne({
    //     where: { id: projectId },
    //   });
    //   if (project?.ownerId !== userId) {
    //     throw new ForbiddenException(
    //       'PROJECT_MANAGER can only assign tasks in their own projects',
    //     );
    //   }
    // }
 
    const task = await this.taskRepository.findOne({
      where: { id: taskId, projectId },
      relations: ['assignee', 'createdBy'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
 
    // Assignee must be a member of the project
    const isMember = await this.projectsService.isUserMemberOfProject(
      projectId,
      assigneeId,
    );
    if (!isMember) {
      throw new BadRequestException(
        'Assignee must be a member of the project',
      );
    }
 
    task.assigneeId = assigneeId;
    const saved = await this.taskRepository.save(task);
    return plainToInstance(TaskResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }
 
 
  async deleteTask(
    projectId: string,
    taskId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    await this.checkProjectExists(projectId);
    await this.checkUserIsMember(projectId, userId, userRole);
 
    // Only ADMIN / PROJECT_MANAGER can delete
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.PROJECT_MANAGER
    ) {
      throw new ForbiddenException('Only ADMIN or PROJECT_MANAGER can delete tasks');
    }
 
    // PROJECT_MANAGER must own the project
    // if (userRole === UserRole.PROJECT_MANAGER) {
    //   const project = await this.projectRepository.findOne({
    //     where: { id: projectId },
    //   });
    //   if (project?.ownerId !== userId) {
    //     throw new ForbiddenException(
    //       'PROJECT_MANAGER can only delete tasks in their own projects',
    //     );
    //   }
    // }
 
    const task = await this.taskRepository.findOne({
      where: { id: taskId, projectId },
      relations: ['assignee', 'createdBy'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    await this.taskRepository.softDelete(taskId);
 
    return { message: 'Task deleted successfully' };
  }
}

