import { createApp, reactive } from 'vue'
import './style.css'
import App from './App.vue'

// 1-导入创建的自定义路由
import router from '@/router/index.js'

// 2-引入第三方 UI 组件库 element-plus 和 css 样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 4-引入 iconfont 字体图标
import '@/assets/icon/iconfont.css'

// 5-引入自己封装的带有请求/响应拦截器的 axios
import Request from '@/utils/Request.js'

// 6-导入自定义封装的 element-plus 的 ElMessage 提示信息封装函数 message
import Message from '@/utils/Message.js'

// 8-导入自定义封装的 element-plus 的 ElMessageBox 提示信息封装函数 Msgbox（包括 Msgbox.confirm、Msgbox.alert）
import Msgbox from '@/utils/Msgbox.js'

// 9-导入缩略图组件 Cover 为全局组件
import Cover from '@/components/Cover.vue'

// 10-导入自己编写的工具类函数文件，在以下挂载为全局属性使用
import * as Tools from '@/utils/Tools.ts'

// 11-导入操作 cookies 的模块包
import VueCookies from 'vue-cookies'

// 12-导入自定义的正则表达式校验函数
import RegVerify from '@/utils/RegVerify.js'

// 13-导入 pinia 状态管理工具包
import { createPinia } from 'pinia'
// 13-创建 pinia 实例
const pinia = createPinia()

// 14-导入 pinia 状态数据自动持久化插件 pinia-plugin-persistedstate
import piniaPersistedState from 'pinia-plugin-persistedstate'
// 14-在 pinia 注册和使用 pinia-plugin-persistedstate 插件
pinia.use(piniaPersistedState)

// 11-从 cookies 获取登录用户的信息，用于赋值到以下 userInfo 全局属性中，供全局其它组件引用
const userInfo = (VueCookies as any).get('userInfo')
if (userInfo?.password) delete userInfo.password // 删除用户密码，不保存到全局属性 userInfo 中

// 创建 App 实例对象
const app = createApp(App)

// 为图方便，挂载 app 实例为 window 全局变量使用（不推荐）
Reflect.defineProperty(window, 'app', { value: app })

// 13-使用 pinia 插件
app.use(pinia)

// 1-使用自定义路由
app.use(router)

// 2-使用第三方 UI 组件库 element-plus
app.use(ElementPlus)

// 9-将 Cover 组件注册为全局组件
app.component('Cover', Cover)

// 5-将自己封装的 axios 挂载为全局属性使用
app.config.globalProperties.Request = Request  // vue2: Vue.prototype.Request = Request

// 6-将自己封装的 Element-Plus 通过 ElMessage() 封装的消息提示函数 Message() 挂载全局属性使用
app.config.globalProperties.Message = Message

// 8-将自己封装的 Element-Plus 通过 ElMessageBox() 封装的确定取消的消息框提示函数 ElMessageBox() 挂载全局属性使用
app.config.globalProperties.Msgbox = Msgbox

// 10-挂载自己编写的工具类函数为全局属性使用
app.config.globalProperties.Tools = Tools

// 11-保存登录用户的信息，以便全局引用
app.config.globalProperties.userInfo = reactive(userInfo || {})

// 12-挂载自定义的正则表达式校验函数，以便全局引用
app.config.globalProperties.RegVerify = RegVerify

// 7-获取用户信息全局变量
app.config.globalProperties.globalInfo = {
    imageUrl: '/api/file/getImage/'
}

// 8-引入和注册全局表格组件
import Table from '@/components/Table.vue'
app.component('Table', Table)

// 挂载到页面
app.mount('#app')
