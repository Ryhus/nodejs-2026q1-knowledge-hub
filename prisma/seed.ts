import 'dotenv/config';
import { Role, Status } from 'generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { randomUUID } from 'node:crypto';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function runSeed() {
  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      login: 'admin',
      password: 'hashed_password',
      role: Role.ADMIN,
    },
  });

  const editor = await prisma.user.create({
    data: {
      id: randomUUID(),
      login: 'editor',
      password: 'hashed_password',
      role: Role.EDITOR,
    },
  });

  const tech = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Tech',
      description: 'Tech news',
    },
  });

  const life = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Life',
      description: 'Life articles',
    },
  });

  const sports = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Sports',
      description: 'Sports news',
    },
  });

  const ai = await prisma.tag.create({
    data: { id: randomUUID(), name: 'AI' },
  });
  const web = await prisma.tag.create({
    data: { id: randomUUID(), name: 'Web' },
  });
  const health = await prisma.tag.create({
    data: { id: randomUUID(), name: 'Health' },
  });
  const react = await prisma.tag.create({
    data: { id: randomUUID(), name: 'React' },
  });
  const node = await prisma.tag.create({
    data: { id: randomUUID(), name: 'Node' },
  });

  const articles = await Promise.all([
    prisma.article.create({
      data: {
        id: randomUUID(),
        title: 'AI Future',
        content: 'AI content',
        status: Status.PUBLISHED,
        authorId: admin.id,
        categoryId: tech.id,
        tags: {
          connect: [{ id: ai.id }, { id: web.id }],
        },
      },
    }),

    prisma.article.create({
      data: {
        id: randomUUID(),
        title: 'Health Tips',
        content: 'Health content',
        status: Status.DRAFT,
        authorId: editor.id,
        categoryId: life.id,
        tags: {
          connect: [{ id: health.id }],
        },
      },
    }),

    prisma.article.create({
      data: {
        id: randomUUID(),
        title: 'React Guide',
        content: 'React content',
        status: Status.PUBLISHED,
        authorId: admin.id,
        categoryId: tech.id,
        tags: {
          connect: [{ id: react.id }, { id: node.id }],
        },
      },
    }),

    prisma.article.create({
      data: {
        id: randomUUID(),
        title: 'Sports News',
        content: 'Sports content',
        status: Status.ARCHIVED,
        authorId: editor.id,
        categoryId: sports.id,
        tags: {
          connect: [{ id: web.id }],
        },
      },
    }),

    prisma.article.create({
      data: {
        id: randomUUID(),
        title: 'Node Basics',
        content: 'Node content',
        status: Status.PUBLISHED,
        authorId: admin.id,
        categoryId: tech.id,
        tags: {
          connect: [{ id: node.id }],
        },
      },
    }),
  ]);

  await prisma.comment.createMany({
    data: [
      {
        id: randomUUID(),
        content: 'Great article!',
        authorId: admin.id,
        articleId: articles[0].id,
      },
      {
        id: randomUUID(),
        content: 'Nice work',
        authorId: editor.id,
        articleId: articles[0].id,
      },
      {
        id: randomUUID(),
        content: 'Very helpful',
        authorId: editor.id,
        articleId: articles[2].id,
      },
    ],
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
