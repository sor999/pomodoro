import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

// 순수 로직·컴포넌트 단위 테스트용. 테스트 파일은 tester가 작성한다.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
