import { defineConfig, globalIgnores } from 'eslint/config';
import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/app/api/**', 'src/lib/**', 'src/utils/**', 'src/instrumentation.ts'],
    ignores: ['src/lib/logger.ts'],
    rules: { 'no-console': 'error' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'node_modules/**',
    'next-env.d.ts',
    '.flowbite-react/**',
    'prisma/generated/**',
  ]),
]);
