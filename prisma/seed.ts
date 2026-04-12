import 'dotenv/config';
import { Role, Status } from 'generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function runSeed() {
  const admin = await prisma.user.create({
    data: {
      id: 'user_admin',
      login: 'admin',
      password: 'hashed_password',
      role: Role.ADMIN,
    },
  });

  const editor = await prisma.user.create({
    data: {
      id: 'user_editor',
      login: 'editor',
      password: 'hashed_password',
      role: Role.EDITOR,
    },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: { id: 'cat_1', name: 'Tech', description: 'Tech news' },
    }),
    prisma.category.create({
      data: { id: 'cat_2', name: 'Life', description: 'Life articles' },
    }),
    prisma.category.create({
      data: { id: 'cat_3', name: 'Sports', description: 'Sports news' },
    }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({ data: { id: 'tag_1', name: 'AI' } }),
    prisma.tag.create({ data: { id: 'tag_2', name: 'Web' } }),
    prisma.tag.create({ data: { id: 'tag_3', name: 'Health' } }),
    prisma.tag.create({ data: { id: 'tag_4', name: 'React' } }),
    prisma.tag.create({ data: { id: 'tag_5', name: 'Node' } }),
  ]);

  const articles = await Promise.all([
    prisma.article.create({
      data: {
        id: 'art_1',
        title: 'AI Future',
        content: 'AI content',
        status: Status.PUBLISHED,
        authorId: admin.id,
        categoryId: categories[0].id,
        tags: { connect: [{ id: 'tag_1' }, { id: 'tag_2' }] },
      },
    }),

    prisma.article.create({
      data: {
        id: 'art_2',
        title: 'Health Tips',
        content: 'Health content',
        status: Status.DRAFT,
        authorId: editor.id,
        categoryId: categories[1].id,
        tags: { connect: [{ id: 'tag_3' }] },
      },
    }),

    prisma.article.create({
      data: {
        id: 'art_3',
        title: 'React Guide',
        content: 'React content',
        status: Status.PUBLISHED,
        authorId: admin.id,
        categoryId: categories[0].id,
        tags: { connect: [{ id: 'tag_4' }, { id: 'tag_5' }] },
      },
    }),

    prisma.article.create({
      data: {
        id: 'art_4',
        title: 'Sports News',
        content: 'Sports content',
        status: Status.ARCHIVED,
        authorId: editor.id,
        categoryId: categories[2].id,
        tags: { connect: [{ id: 'tag_2' }] },
      },
    }),

    prisma.article.create({
      data: {
        id: 'art_5',
        title: 'Node Basics',
        content: 'Node content',
        status: Status.PUBLISHED,
        authorId: admin.id,
        categoryId: categories[0].id,
        tags: { connect: [{ id: 'tag_5' }] },
      },
    }),
  ]);

  await prisma.comment.createMany({
    data: [
      {
        id: 'c_1',
        content: 'Great article!',
        authorId: admin.id,
        articleId: articles[0].id,
      },
      {
        id: 'c_2',
        content: 'Nice work',
        authorId: editor.id,
        articleId: articles[0].id,
      },
      {
        id: 'c_3',
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
