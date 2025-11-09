import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RequestUser } from '../common/decorators/user.decorator';
import { PaginatedResponse, ProjectDto } from '@fullstack/types';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: RequestUser, query: ProjectQueryDto): Promise<PaginatedResponse<ProjectDto>> {
    const { page = 1, pageSize = 10, status, search } = query;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (user.role !== 'admin') {
      where.ownerId = user.id;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' }
      }),
      this.prisma.project.count({ where })
    ]);

    return {
      data: data.map((project) => this.toDto(project)),
      total,
      page,
      pageSize
    };
  }

  async findOne(user: RequestUser, id: string): Promise<ProjectDto> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (user.role !== 'admin' && project.ownerId !== user.id) {
      throw new ForbiddenException();
    }
    return this.toDto(project);
  }

  async create(user: RequestUser, dto: CreateProjectDto): Promise<ProjectDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        ownerId: user.id
      }
    });
    return this.toDto(project);
  }

  async update(user: RequestUser, id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (user.role !== 'admin' && project.ownerId !== user.id) {
      throw new ForbiddenException();
    }
    const updated = await this.prisma.project.update({ where: { id }, data: dto });
    return this.toDto(updated);
  }

  async remove(user: RequestUser, id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (user.role !== 'admin' && project.ownerId !== user.id) {
      throw new ForbiddenException();
    }
    await this.prisma.project.delete({ where: { id } });
  }

  private toDto(project: any): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description ?? undefined,
      status: project.status,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };
  }
}
