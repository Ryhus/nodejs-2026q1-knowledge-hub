import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      'generated/prisma': path.resolve(__dirname, './generated/prisma'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        branches: 85,
      },
      include: [
        'src/**/*.service.ts',
        'src/**/*.guard.ts',
        'src/**/*.dto.ts',
        'src/shared/exceptions/filters',
        'src/shared/interceptors',
      ],
      exclude: [
        'src/CategoriesModule/categories.service.ts',
        'src/CommentsModule/comments.service.ts',
        'src/PasswordModule/password.service.ts',
        'src/PrismaModule/prisma.service.ts',
        'src/AppLoggerModule/appLogger.service.ts',
      ],
    },
  },
});
