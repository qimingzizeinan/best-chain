import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
// 引入 vue-router
import router from './router'

import './assets/css/index.css'
// 单独引入 ElMessage 和 ElMessageBox 的样式
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'

async function bootstrap() {
  const app = createApp(App)
  app.use(store)
  app.use(router)

  app.mount('#app')
}
bootstrap()
