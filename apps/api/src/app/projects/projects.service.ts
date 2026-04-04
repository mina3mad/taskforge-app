import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async isUserMemberOfProject(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.projectRepository
      .createQueryBuilder('project')
      .innerJoin('project.members', 'member')
      .where('project.id = :projectId', { projectId })
      .andWhere('member.id = :userId', { userId })
      .getCount();

    return count > 0;
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

    const full = await this.projectRepository.findOne({
      where: { id: saved.id },
      relations: ['owner', 'members'],
    });

    return plainToInstance(ProjectResponseDto, full, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    options: Options,
  ): Promise<{ data: ProjectResponseDto[], total: number }> {
    let projects: Project[];
    let total: number;

    if (userRole === UserRole.ADMIN) {
      [projects, total] = await this.projectRepository.findAndCount({
        relations: ['owner', 'members'],
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      });
    } else {
      // else Return only projects the user owns or is a member of
      [projects, total] = await this.projectRepository.findAndCount({
        relations: ['owner', 'members'],
        where: [
          { owner: { id: userId } }, // owner
          { members: { id: userId } }, // member
        ],
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      });
    }

    const data = projects.map((p) =>
      plainToInstance(ProjectResponseDto, p, {
        excludeExtraneousValues: true,
      }),
    );

    return { data, total };
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

  async addMember(
    projectId: string,
    targetUserEmail: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner', 'members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    this.canEditProject(project, requesterId, requesterRole);

    const userToAdd = await this.userRepository.findOne({
      where: { email: targetUserEmail },
    });
    if (!userToAdd) {
      throw new NotFoundException('User with this email not found');
    }

    const alreadyMember = await this.isUserMemberOfProject(
      projectId,
      userToAdd.id,
    );
    if (alreadyMember) {
      throw new BadRequestException('User is already a member of this project');
    }

    project.members.push(userToAdd);
    await this.projectRepository.save(project);

    return plainToInstance(ProjectResponseDto, project, {
      excludeExtraneousValues: true,
    });
  }

  async removeMember(
    projectId: string,
    targetUserId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner', 'members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    this.canEditProject(project, requesterId, requesterRole);

    if (project.ownerId === targetUserId) {
      throw new ForbiddenException('Cannot remove the project owner');
    }

    const alreadyMember = await this.isUserMemberOfProject(
      projectId,
      targetUserId,
    );
    if (!alreadyMember) {
      throw new BadRequestException('User is not a member of this project');
    }

    project.members = project.members.filter((m) => m.id !== targetUserId);
    const saved = await this.projectRepository.save(project);

    return plainToInstance(ProjectResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }
}
