import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RequestUser } from '../common/decorators/user.decorator';
import { PaginatedResponse, TaskDto } from '@fullstack/types';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: RequestUser, query: TaskQueryDto): Promise<PaginatedResponse<TaskDto>> {
    const { page = 1, pageSize = 10, status, search, projectId } = query;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (projectId) {
      where.projectId = projectId;
    }

    if (user.role !== 'admin') {
      where.project = { ownerId: user.id };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: { project: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' }
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      data: data.map((task) => this.toDto(task)),
      total,
      page,
      pageSize
    };
  }

  async findOne(user: RequestUser, id: string): Promise<TaskDto> {
    const task = await this.prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (user.role !== 'admin' && task.project.ownerId !== user.id) {
      throw new ForbiddenException();
    }
    return this.toDto(task);
  }

  async create(user: RequestUser, dto: CreateTaskDto): Promise<TaskDto> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (user.role !== 'admin' && project.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
      },
      include: { project: true }
    });
    return this.toDto(task);
  }

  async update(user: RequestUser, id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const existing = await this.prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }
    if (user.role !== 'admin' && existing.project.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    if (dto.projectId && dto.projectId !== existing.projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      if (user.role !== 'admin' && project.ownerId !== user.id) {
        throw new ForbiddenException();
      }
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        status: dto.status ?? existing.status,
        projectId: dto.projectId ?? existing.projectId,
        assigneeId: dto.assigneeId ?? existing.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : existing.dueDate
      },
      include: { project: true }
    });
    return this.toDto(task);
  }

  async remove(user: RequestUser, id: string): Promise<void> {
    const existing = await this.prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }
    if (user.role !== 'admin' && existing.project.ownerId !== user.id) {
      throw new ForbiddenException();
    }
    await this.prisma.task.delete({ where: { id } });
  }

  private toDto(task: any): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      projectId: task.projectId,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
      assigneeId: task.assigneeId ?? undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };
  }
}
