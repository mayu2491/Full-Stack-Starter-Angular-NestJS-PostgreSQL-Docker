import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser, RequestUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles('member', 'admin')
  findAll(@CurrentUser() user: RequestUser, @Query() query: ProjectQueryDto) {
    return this.projectsService.list(user, query);
  }

  @Get(':id')
  @Roles('member', 'admin')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projectsService.findOne(user, id);
  }

  @Post()
  @Roles('member', 'admin')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user, dto);
  }

  @Put(':id')
  @Roles('member', 'admin')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('member', 'admin')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projectsService.remove(user, id);
  }
}
