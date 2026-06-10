import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppLoggerService } from 'src/AppLoggerModule/appLogger.service';
import { PrismaService } from './PrismaModule/prisma.service';

const PORT = process.env.PORT || String(4000);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(AppLoggerService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useLogger(logger);

  const config = new DocumentBuilder()
    .setTitle('Knowledge Hub API')
    .setDescription(
      'The Knowledge Hub allows users to create, edit, and organize articles by categories and tags',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.tags = [
    {
      name: 'auth',
      description: 'Authentication and authorization',
    },
    {
      name: 'user',
      description: 'User management',
    },
    { name: 'article', description: 'Articles CRUD and publishing' },
    {
      name: 'category',
      description: 'Categories management',
    },
    {
      name: 'comment',
      description: 'Comments management',
    },
    {
      name: 'ai',
      description: 'AI operations',
    },
    {
      name: 'rag',
      description: 'RAG service',
    },
  ];

  SwaggerModule.setup('/doc', app, document);

  await app.listen(PORT);

  const shutdown = async (reason: string, error?: any) => {
    try {
      logger.error({
        level: 'fatal',

        message: reason,

        trace: error instanceof Error ? error.stack : String(error),
      });

      await app.close();

      const prisma = app.get(PrismaService);
      await prisma.$disconnect();
    } catch (e) {
      console.error('Shutdown error:', e);
    } finally {
      process.exit(1);
    }
  };

  process.on('uncaughtException', (error) => {
    shutdown('Uncaught Exception', error);
  });

  process.on('unhandledRejection', (reason) => {
    shutdown('Unhandled Rejection', reason);
  });
}
bootstrap();
