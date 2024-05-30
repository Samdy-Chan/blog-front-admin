// 导入类 ajax 的 axios 模块
import axios from 'axios'

// 导入 element-plus 相关方法
import { ElLoading } from 'element-plus'
// 导入自定义封装的 element-plus 的 ElMessage 提示信息封装函数 message
import Message from '@/utils/Message.js'

// 导入自定义路由
import router from '@/router'

// 定义表单数据格式类型常量
const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8"
const contentTypeJson = "application/json"
const contentTypeFile = "multipart/form-data"

// 获取和添加提交网络请求的参数设置
const request = (config) => {
    let { url, params, dataType = 'form', showLoading = true } = config

    let contentType = contentTypeForm
    if (dataType === 'json') {
        contentType = contentTypeJson
    } else if (dataType === 'file') {
        contentType = contentTypeFile
        let param = new FormData()
        for (let key in params) {
            param.append(key, params[key])
        }
        params = param
    }

    // 创建 axios 请求及请求头设置
    const instance = axios.create({
        baseURL: 'https://api.blog.sirurl.cn/api',
        timeout: 5 * 1000,  // 5秒超时
        headers: {
            'Content-Type': contentType,
            'X-Requested-With': 'XMLHttpRequest',
        },
    })

    // 创建 axios 请求拦截器
    let loading = null
    instance.interceptors.request.use(
        (config) => {
            // 显示"加载中"遮罩层
            if (showLoading) {
                loading = ElLoading.service({
                    lock: true,
                    text: '正在加载中...',
                    background: 'rgba(0, 0, 0, 0.7)',
                })
            }
            // 必须要有返回，否则报错：TypeError: Cannot read properties of undefined (reading 'cancelToken')
            return config
        },
        (error) => {
            // 隐藏"加载中"遮罩层
            if (showLoading && loading) {
                loading.close()
            }

            // 显示错误提示消息
            Message.error('发送请求失败')
            return Promise.reject('发送请求失败')
        }
    )

    // 创建 axios 响应（请求后）拦截器
    instance.interceptors.response.use(
        (response) => {
            // 隐藏"加载中"遮罩层
            if (showLoading && loading) {
                loading.close()
            }

            // 获取请求后的数据
            const responseData = response.data
            if (responseData.status === 'error') {
                return Promise.reject(responseData.info)
            } else {
                // 登录超时，跳转路由到登录页
                if (responseData.code === 901) {
                    setTimeout(() => {
                        router.push('/login')
                    }, 2000);
                    return Promise.reject('登录超时')
                }

                // 返回后端接口响应回来的数据
                return responseData
            }
        },
        (error) => {
            console.log(error)
            // 隐藏"加载中"遮罩层
            if (showLoading && loading) {
                loading.close()
            }

            return Promise.reject('网络异常')

        }
    )

    // 发起请求：方法一（推荐使用此方法，有返回 null）
    return instance.post(url, params).catch(error => {
        Message.error(error)
        return null
    })

    // 发起请求：方法二（catch 里没有返回值）
    /* const result = new Promise((resolve, reject) => {
        instance.post(url, params).then(res => {
            resolve(res)
        }).catch(error => {
            Message.error(error)
        })
    })
    return result */
}

export default request