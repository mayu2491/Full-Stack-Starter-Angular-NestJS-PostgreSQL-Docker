import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser, RequestUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @Roles('member', 'admin')
  findAll(@CurrentUser() user: RequestUser, @Query() query: TaskQueryDto) {
    return this.tasksService.list(user, query);
  }

  @Get(':id')
  @Roles('member', 'admin')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.tasksService.findOne(user, id);
  }

  @Post()
  @Roles('member', 'admin')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user, dto);
  }

  @Put(':id')
  @Roles('member', 'admin')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles('member', 'admin')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.tasksService.remove(user, id);
  }
}
