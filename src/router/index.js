// 导入创建路由和历史路由函数
import { createRouter, createWebHistory } from 'vue-router'

// 导入自定义封装的 element-plus 的 ElMessage 提示信息封装函数 message
import Message from '@/utils/Message.js'

// 定义路由
const routes = [
    {
        name: '登录',
        path: '/login',
        component: () => import('@/views/Login.vue'),
    },
    {
        name: '框架页',
        path: '/',
        component: () => import('@/views/Framework.vue'),
        redirect: '/blog/list', // 进入首页根路由/后，自动切换到 /blog/list 路由
        children: [
            {
                name: '测试组件',
                path: '/blog/test',
                component: () => import('@/views/blog/Test.vue')
            },
            {
                name: '博客管理',
                path: '/blog/list',
                component: () => import('@/views/blog/BlogList.vue'),
            },
            {
                name: '分类管理',
                path: '/blog/category',
                component: () => import('@/views/blog/BlogCategory.vue'),
            },
            {
                name: '专题管理',
                path: '/special/list',
                component: () => import('@/views/special/SpecialList.vue'),
            },
            {
                name: '个人设置',
                path: '/settings/my',
                component: () => import('@/views/settings/MyInfo.vue')
            },
            {
                name: '博客成员',
                path: '/settings/user',
                component: () => import('@/views/settings/TeamUser.vue')
            },
            {
                name: '系统设置',
                path: '/settings/system',
                component: () => import('@/views/settings/SysSettings.vue')
            },
            {
                name: '回收站',
                path: '/recycle/list',
                component: () => import('@/views/recycle/RecycleList.vue')
            }
        ]
    },
]

// 这里不是通过 new 来创建路由，而是通过 createRouter 方法来创建，使用的模式不是通过 mode 来定义
const router = createRouter({
    routes,
    history: createWebHistory(),
})

// 设置路由跳转前置操作（即跳转路由前的操作），读取 pinia store 中的 user 信息是否已经登录
import { useUserStore } from '@/store/userStore.js'
import { storeToRefs } from 'pinia'
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()  // 路由前置操作，store 必须放在此 router.beforeEach 方法内，不能放在外面，否则报错
    const { user } = storeToRefs(userStore)  // storeToRefs 可以将 state 属性转换为响应式，默认通过解构赋值方式不是响应式
    // console.log('router.beforeEach userStore:', user)
    // 如果 userStore 中没有登录用户的信息，则跳转到登录页面
    if (!user?.value?.user_id && to.path !== '/login') {
        console.log('请先登录')
        Message.error('请先登录')
        setTimeout(() => {
            router.push('/login')
        }, 500);
    }
    next()  // 必须加上这个，否则无法跳转路由
})

// 暴露创建的路由
export default router

