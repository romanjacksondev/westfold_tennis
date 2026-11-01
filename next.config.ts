import withFlowbiteReact from 'flowbite-react/plugin/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR
    ? {
        typescript: { tsconfigPath: process.env.NEXT_TSCONFIG_PATH ?? 'tsconfig.json' },
      }
    : {}),
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  cacheComponents: true,
  partialPrefetching: true,
};

export default withFlowbiteReact(nextConfig);
