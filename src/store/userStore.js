import { defineStore } from 'pinia'

import { cookieStorage } from '@/store/cookieStorage.js'

/**
 *   在其它页面组件中通过以下方法：
 *   import useUserStore from '@/store/userStore.js'
 *   const userStore = useUserStore()
 *   加载此 userStore 模块后，通过如下方法操作 store
 *   1、通过如下方法读取/设置 state 数据
 *      userStore.user = {xx: 'yy'}
 *      同时设置多个 state 数据方法一（对象参数式）：
 *      userStore.$patch({user: {}, age: 20}) 
 *      同时设置多个 state 数据方法二（回调函数式，推荐此方法高性能）：
 *      userStore.$patch( (state) => {
 *        state.user = {}
 *        age = 20
 *      })
 *    2、订阅（捕获） state 修改
 *       userStore.$subscribe((mutation, state)
 *    3、订阅（捕获） actions 函数调用
 *       userStore.$onAction(callback, true)  // 参数二 true，表示组件 unmount 后，仍有效，缺省，组件销毁，订阅事件也销毁
 *    4、手动取消订阅 actions 
 *       const unsubscribe = someStore.$onAction(callback)
 *       unsubscribe()
 *    5、可在任意组件中通过 userStore.$hydrate() 方法手动提取保存在 storage 中的数据，应用首次运行时，会自动提取一次
 *    6、应用在运行或刷新页面后，会自动将 store state 中的数据持久化到 storage，也可通过 userStore.$persist() 方法手动持久化，
 *       当修改或通过 actions 修改 state 的数据，才会自动持久化到 storage
 *    更多详细说明见 pinia 官网：https://pinia.vuejs.org/core-concepts/actions.html
 */

export const useUserStore = defineStore('userStore', {
    // 状态数据
    state: () => ({
        user: {},
    }),

    // getters 定义
    geters: {},

    // actions 定义
    actions: {},

    // 自动持久化插件 pinia-plugin-persistedstate 的配置部分，配置单存储对象，用{}即可，多个用数组[]配置
    persist: [
        // sessionStorage 存储配置部分
        {
            // 使用 sessionStorage 本地存储
            storage: window.sessionStorage,
            // 保存到 storage 中数据的 key 键名
            key: 'userInfo',
            // 指定要保存 state 中哪些数据到 storage，默认值为 undefined，和 null 一样默认保存 state 中所有数据，
            // 使用数组指定要保存到 storage 中的数据，如 ['user']，或 ['user.userId']，空数组 [] 表示不保存任何数据，但会自动提取所有数据
            paths: null,
            // 插件在默认自动提取或通过 userStore.$hydrate() 手动拉取 storage 中的数据前，自动触发该回调函数，
            // ctx 是该插件的上下文对象，包括 pinia 实例、该 store 的 state/getters/actions 信息、
            // 和 main.js 里挂载的整个应用的 app 实例信息，beforeRestore 该回调方法在 useUserStore() 方法之前调用，
            // userStore.$hydrate({runHooks: false})，手动提取 store 数据时，加上 {runHooks: false} 参数后，
            // 不会触发 beforeRestore 和 beforeRestore 回调函数
            /* beforeRestore: (ctx) => {
                console.log('piniaPlugPersistedstate beforeRestore ctx:', ctx)
            }, */
            // 插件在默认自动提取或通过 userStore.$hydrate() 手动拉取 storage 中的数据后，自动触发该回调函数，
            // ctx 是该插件的上下文对象，包括 pinia 实例、该 store 的 state/getters/actions 信息、
            // 和 main.js 里挂载的整个应用的 app 实例信息，afterRestore 该回调方法在 useUserStore() 方法之前调用，
            // userStore.$hydrate({runHooks: false})，手动提取 store 数据时，加上 {runHooks: false} 参数后，
            // 不会触发 beforeRestore 和 beforeRestore 回调函数
            /* afterRestore: (ctx) => {
                console.log('piniaPlugPersistedstate afterRestore ctx:', ctx)
            }, */
            // 调试开关，默认值 false。设为 true ，会自动在持久化或提取数据时发生的错误，通过控制台 console.error()打印出来
            debug: true
        },
        // cookieStorage 存储配置部分
        {
            storage: cookieStorage,
            key: 'userInfo',
            paths: undefined,
            debug: true
        }
    ]
})
