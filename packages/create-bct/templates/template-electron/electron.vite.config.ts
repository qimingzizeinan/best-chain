import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { viteMockServe } from 'vite-plugin-mock'
// import typescript from "@rollup/plugin-typescript";
import { swc } from 'rollup-plugin-swc3'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main/src'),
        '@ipc': resolve('src/ipc/src'),
      },
    },
    build: {
      rollupOptions: {
        external: ['@electron-toolkit/utils'],
      },
    },
    plugins: [
      swc({
        jsc: {
          parser: {
            syntax: 'typescript',
            // tsx: true, // If you use react
            dynamicImport: true,
            decorators: true,
          },
          target: 'es2021',
          transform: {
            decoratorMetadata: true,
          },
        },
      }),
    ],
    esbuild: false,
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['@electron-toolkit/preload'],
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@ipc': resolve('src/ipc/src'),
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        // 自定引入 Vue VueRouter API,如果还需要其他的可以自行引入
        imports: ['vue', 'vue-router'],
        // 调整自动引入的文件位置
        dts: 'src/type/auto-import.d.ts',
        // 解决自动引入eslint报错问题 需要在eslintrc的extend选项中引入
        eslintrc: {
          enabled: true,
          // 配置文件的位置
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/type/components.d.ts',
      }),
      // 配置mock
      viteMockServe({
        mockPath: '/mock',
        localEnabled: true,
      }),
    ],
  },
})
