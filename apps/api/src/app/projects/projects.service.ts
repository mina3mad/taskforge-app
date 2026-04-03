import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserRole } from '../users/enum/user-role.enum';
import { Options } from 'src/shared/options.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private canEditProject(
    project: Project,
    userId: string,
    userRole: UserRole,
  ): void {
    if (userRole === UserRole.ADMIN) return;
    if (userRole === UserRole.PROJECT_MANAGER && project.ownerId === userId)
      return;
    throw new ForbiddenException(
      'You do not have permission to edit this project',
    );
  }

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const owner = await this.userRepository.findOne({ where: { id: userId } });
    if (!owner) {
      throw new NotFoundException('User not found');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      ownerId: userId,
      members: [owner],
    });

    const saved = await this.projectRepository.save(project);
    return plainToInstance(ProjectResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    options: Options,
  ): Promise<ProjectResponseDto[]> {
    let projects: Project[];

    if (userRole === UserRole.ADMIN) {
      projects = await this.projectRepository.find({
        relations: ['owner', 'members'],
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      });
    } else {
      // else Return only projects the user owns or is a member of
      projects = await this.projectRepository.find({
        relations: ['owner', 'members'],
        where: [
          { owner: { id: userId } }, // owner
          { members: { id: userId } }, // member
        ],
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      });
    }

    return projects.map((p) =>
      plainToInstance(ProjectResponseDto, p, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(projectId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner', 'members'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return plainToInstance(ProjectResponseDto, project, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner', 'members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    this.canEditProject(project, userId, userRole);

    Object.assign(project, updateProjectDto);
    const saved = await this.projectRepository.save(project);
    return plainToInstance(ProjectResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async remove(
    projectId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ message: string }> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner', 'members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    this.canEditProject(project, userId, userRole);

    await this.projectRepository.softDelete(projectId);
    return { message: 'Project deleted successfully' };
  }
}
