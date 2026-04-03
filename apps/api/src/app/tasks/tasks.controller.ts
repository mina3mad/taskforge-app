import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/authorization/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/authorization/guard/role.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CurrentUser } from '../auth/authorization/decorator/current-user.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { Options } from 'src/shared/options.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.tasksService.create(
      projectId,
      createTaskDto,
      user.userId,
      user.userRole,
    );
  }

  @Get()
  findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: { userId: string; userRole: UserRole },
    @Query() options: Options,
  ) {
    return this.tasksService.findAll(projectId, user.userId, user.userRole,options);
  }
 
  @Get(':taskId')
  findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.tasksService.findOne(
      projectId,
      taskId,
      user.userId,
      user.userRole,
    );
  }

  @Patch(':taskId')
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.tasksService.updateTitleOrDescription(
      projectId,
      taskId,
      updateTaskDto,
      user.userId,
      user.userRole,
    );
  }
 
  @Patch(':taskId/status')
  updateStatus(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.tasksService.updateStatus(
      projectId,
      taskId,
      updateTaskStatusDto,
      user.userId,
      user.userRole,
    );
  }

  @Patch(':taskId/assign')
  assignTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body('assigneeId',ParseUUIDPipe) assigneeId: string,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.tasksService.assignTask(
      projectId,
      taskId,
      assigneeId,
      user.userId,
      user.userRole,
    );
  }
 
  @Delete(':taskId')
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: { userId: string; userRole: UserRole },
  ) {
    return this.tasksService.deleteTask(
      projectId,
      taskId,
      user.userId,
      user.userRole,
    );
  }
}
