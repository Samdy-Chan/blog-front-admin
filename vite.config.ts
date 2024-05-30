import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// 自己加：引入语言高亮插件
import { prismjsPlugin } from 'vite-plugin-prismjs'

// 自己加：导入 path 模块，以下路径配置项会用到
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 自己加：加入语言高亮插件支持
    prismjsPlugin({
      languages: ['js', 'ts', 'json', 'css', 'html', 'java', 'php', 'sh', 'py'],
    }),
  ],
  // 自己加：server 配置项
  server: {
    hmr: true,
    host: '127.0.0.1',
    port: 3001,
    /* proxy: {
      '/api': {
        // target: loadEnv(mode, process.cwd()).VITE_APP_PROXY_TARGET,  // 目标代理接口地址
        target: 'http://localhost:8090/',
        secure: false,
        changeOrigin: true,  // 开启代理，在本地创建一个虚拟服务器
        pathRewrite: {
          '^/api': '/api',
        },
      },
    }, */
  },
  // 自己加：路径配置项
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
      '#': path.resolve(__dirname, './src/ts'),
    },
  },
})
