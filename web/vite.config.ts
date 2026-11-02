import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 打包后资源用相对路径（dist/index.html 引用 ./assets/...，可放任意子目录/直接打开）
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Big libraries get their own files: they download in parallel and stay cached between site updates
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/three/') || id.includes('three-stdlib') || id.includes('three-mesh-bvh')) return 'vendor-three'
          if (id.includes('@react-three') || id.includes('/drei/')) return 'vendor-r3f'
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'vendor-motion'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react'
          return undefined
        },
      },
    },
  },
  server: { host: true, port: 5173 },
})
