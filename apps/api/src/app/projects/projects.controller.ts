import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/authorization/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guard/role.guard';
import { Roles } from '../auth/authorization/decorator/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { CurrentUser } from '../auth/authorization/decorator/current-user.decorator';
import { Options } from 'src/shared/options.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.projectsService.create(createProjectDto, user.userId);
  }

  @Get()
  findAll(
    @CurrentUser() user: { userId: string; userRole: UserRole },
    @Query() options: Options,
  ) {
    return this.projectsService.findAll(user.userId, user.userRole, options);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.projectsService.update(
      id,
      updateProjectDto,
      user.userId,
      user.userRole,
    );
  }
 
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.projectsService.remove(id, user.userId, user.userRole);
  }
}
