import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isNode = mode === 'node';
  const outDir = isNode ? './out/node' : './out/web';
  return {
    build: {
      outDir,
      lib: {
        entry: './src/extension.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: ['vscode'],
        output: {
          entryFileNames: 'extension.js',
        },
      },
    },
  };
});
