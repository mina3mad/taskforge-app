import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User])],
  providers: [ProjectsService],
  controllers: [ProjectsController]
})
export class ProjectsModule {}
