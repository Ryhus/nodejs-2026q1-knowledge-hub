import { defineConfig } from 'vitest/config';

export default defineConfig({
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
        'src/shared/exceptions',
      ],
      exclude: [
        'src/CategoriesModule',
        'src/CommentsModule',
        'src/PasswordModule',
        'src/PrismaModule',
      ],
    },
  },
});
