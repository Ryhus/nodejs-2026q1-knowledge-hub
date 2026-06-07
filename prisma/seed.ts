import 'dotenv/config';
import { Role } from 'generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function runSeed() {
  const adminUser = await prisma.user.upsert({
    where: { login: 'Test1' },
    update: {},
    create: {
      id: 'ab9f1410-6c22-4516-8d57-686f2c048848',
      login: 'Test1',
      password: '$2b$10$DXXtCwlQrmyW5cI0aFpnr.ISTiTaKJrVYiyoYOHFwKWaKdCQaVUIe',
      role: Role.admin,
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { login: 'Test2' },
    update: {},
    create: {
      id: '0a423074-8b40-44c6-9c93-514ee3a66308',
      login: 'Test2',
      password: '$2b$10$DXXtCwlQrmyW5cI0aFpnr.ISTiTaKJrVYiyoYOHFwKWaKdCQaVUIe',
      role: Role.viewer,
    },
  });

  const gamesCategory = await prisma.category.upsert({
    where: { id: '2088cb52-d4f0-4385-973c-f5916756a8fc' },
    update: {},
    create: {
      id: '2088cb52-d4f0-4385-973c-f5916756a8fc',
      name: 'games',
      description: 'computer games',
    },
  });

  const reactCategory = await prisma.category.upsert({
    where: { id: '64d6556b-0955-43d2-acc5-66a72326c837' },
    update: {},
    create: {
      id: '64d6556b-0955-43d2-acc5-66a72326c837',
      name: 'react',
      description: 'react',
    },
  });

  const animalsCategory = await prisma.category.upsert({
    where: { id: '65a5cbe3-4b05-444d-94a3-2d7b86817705' },
    update: {},
    create: {
      id: '65a5cbe3-4b05-444d-94a3-2d7b86817705',
      name: 'animals',
      description: 'animals',
    },
  });

  const ragCategory = await prisma.category.upsert({
    where: { id: '7d5e3aa6-6d92-487b-afd5-2f06336386dd' },
    update: {},
    create: {
      id: '7d5e3aa6-6d92-487b-afd5-2f06336386dd',
      name: 'rag',
      description: 'rag',
    },
  });

  const gitCategory = await prisma.category.upsert({
    where: { id: 'ff28c3b9-9630-40d9-a801-ba6d04110baa' },
    update: {},
    create: {
      id: 'ff28c3b9-9630-40d9-a801-ba6d04110baa',
      name: 'git',
      description: 'git',
    },
  });
}

runSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
