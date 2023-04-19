import 'vant/lib/index.css';
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { install } from 'vant';
// 2. 引入组件样式

import App from './App.vue'
import router from './router'



const app = createApp(App)
install(app)
app.use(createPinia())
app.use(router)

app.mount('#app')
