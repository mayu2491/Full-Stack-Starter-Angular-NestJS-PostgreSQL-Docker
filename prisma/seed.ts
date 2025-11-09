import { PrismaClient, Role, ProjectStatus, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('changeme', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      role: Role.ADMIN,
      name: 'System Admin'
    }
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      password,
      role: Role.MEMBER,
      name: 'Project Member'
    }
  });

  const projectOne = await prisma.project.upsert({
    where: { id: 'project-one' },
    update: {},
    create: {
      id: 'project-one',
      name: 'Fullstack Launch',
      description: 'Kick-off the new SaaS experience',
      status: ProjectStatus.active,
      ownerId: admin.id,
      tasks: {
        create: [
          {
            title: 'Design system tokens',
            status: TaskStatus.in_progress,
            description: 'Create the base typography and color tokens.'
          },
          {
            title: 'API contract review',
            status: TaskStatus.todo,
            description: 'Review the OpenAPI document with stakeholders.'
          }
        ]
      }
    }
  });

  await prisma.project.upsert({
    where: { id: 'project-two' },
    update: {},
    create: {
      id: 'project-two',
      name: 'Mobile companion app',
      description: 'Deliver an iOS companion for power users',
      status: ProjectStatus.planned,
      ownerId: member.id,
      tasks: {
        create: [
          {
            title: 'User interview synthesis',
            status: TaskStatus.todo
          },
          {
            title: 'Prototype navigation flows',
            status: TaskStatus.todo
          }
        ]
      }
    }
  });

  console.log('Seeded admin:', admin.email, 'member:', member.email, 'project:', projectOne.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
