import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { Role, Status } from 'generated/prisma/enums';

const ADMIN = {
  id: 'ab9f1410-6c22-4516-8d57-686f2c048848',
  login: 'admin',
  password: 'Admin123!',
};

const categories = [
  {
    id: '7d5e3aa6-6d92-487b-afd5-2f06336386dd',
    name: 'Artificial intelligence',
    description:
      'Articles about AI, embeddings, and retrieval-augmented generation.',
  },
  {
    id: 'ff28c3b9-9630-40d9-a801-ba6d04110baa',
    name: 'Backend development',
    description: 'Server-side development, APIs, and application architecture.',
  },
  {
    id: '65a5cbe3-4b05-444d-94a3-2d7b86817705',
    name: 'Engineering practices',
    description: 'Practical guidance for building and maintaining software.',
  },
];

const articles = [
  {
    id: '0c1a5bc5-6476-4b7c-b7fd-a4057dc4af01',
    title: 'Building reliable RAG retrieval',
    content:
      'Retrieval-augmented generation combines a language model with relevant documents. Split documents into coherent chunks, store their embeddings, and retrieve the closest chunks for every question. Keep source metadata with each chunk so answers can cite the originating article.',
    status: Status.published,
    categoryId: '7d5e3aa6-6d92-487b-afd5-2f06336386dd',
    tags: ['rag', 'ai', 'search'],
  },
  {
    id: '1d2b6cd6-7587-4c8d-c8fe-b5168ed5bf02',
    title: 'Designing a secure NestJS API',
    content:
      'A secure API starts with authentication and authorization. Use short-lived access tokens, rotate refresh tokens, validate every request, and apply role checks at controller boundaries. Return consistent error responses and never expose secrets in logs.',
    status: Status.published,
    categoryId: 'ff28c3b9-9630-40d9-a801-ba6d04110baa',
    tags: ['nestjs', 'security', 'jwt'],
  },
  {
    id: '2e3c7de7-8698-4d9e-d9af-c6279fe6cf03',
    title: 'A practical code review checklist',
    content:
      'Code reviews are most effective when they focus on behaviour, readability, tests, and operational impact. Confirm that the implementation meets the requirement, handles invalid input, protects sensitive data, and has focused automated tests.',
    status: Status.draft,
    categoryId: '65a5cbe3-4b05-444d-94a3-2d7b86817705',
    tags: ['code-review', 'testing', 'quality'],
  },
];

const comments = [
  {
    id: '3f4d8ef8-97a9-4eaf-eab0-d738aff7df04',
    articleId: '0c1a5bc5-6476-4b7c-b7fd-a4057dc4af01',
    content: 'Add a reindex step whenever published content changes.',
  },
  {
    id: '4a5e9f09-a8ba-4fb0-fbc1-e849b0f8ef05',
    articleId: '1d2b6cd6-7587-4c8d-c8fe-b5168ed5bf02',
    content:
      'Token rotation and request validation are especially important for public endpoints.',
  },
  {
    id: '5b6fa01a-b9cb-40c1-acd2-f95ac1f9fa06',
    articleId: '2e3c7de7-8698-4d9e-d9af-c6279fe6cf03',
    content:
      'The checklist should include documentation changes when an API contract changes.',
  },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export async function runSeed() {
  const password = await bcrypt.hash(ADMIN.password, 10);

  await prisma.user.upsert({
    where: { login: ADMIN.login },
    update: { password, role: Role.admin },
    create: { ...ADMIN, password, role: Role.admin },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name, description: category.description },
      create: category,
    });
  }

  for (const article of articles) {
    const { tags, ...articleData } = article;

    await prisma.article.upsert({
      where: { id: article.id },
      update: {
        ...articleData,
        authorId: ADMIN.id,
        tags: {
          set: [],
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      create: {
        ...articleData,
        authorId: ADMIN.id,
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  }

  for (const comment of comments) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {
        content: comment.content,
        authorId: ADMIN.id,
        articleId: comment.articleId,
      },
      create: { ...comment, authorId: ADMIN.id },
    });
  }

  console.info(
    `Seeded ${categories.length} categories, ${articles.length} articles, and ${comments.length} comments.`,
  );
}

runSeed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
