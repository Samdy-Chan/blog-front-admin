<template>
  <div class="login-body">
    <div class="login-panel">
      <div class="login-title">用户登录</div>
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @keyup.enter.native="login"
      >
        <!-- 帐号输入框 -->
        <el-form-item prop="account">
          <el-input
            v-model="formData.account"
            placeholder="请输入账号"
            size="large"
            maxlength="16"
            :autofocus="true"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            placeholder="请输入密码"
            size="large"
            type="password"
            maxlength="16"
          >
            <template v-slot:prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 验证码输入框 -->
        <div class="checkcode-box">
          <el-form-item prop="checkCode">
            <el-input
              v-model="formData.checkCode"
              class="checkcode-input"
              placeholder="请输入验证码"
              size="large"
              maxlength="4"
              :style="{ height: '40px' }"
            />
            <!-- 验证码异步组件 -->
            <suspense>
              <template v-slot:default>
                <div>
                  <hm-yzm
                    ref="myYzm"
                    style="margin-left: 2px"
                    :w="120"
                    :h="36"
                    :rndStrLen="4"
                    @getYzm="getYzm"
                  />
                </div>
              </template>
              <!--               
              <template v-slot:fallback>
                <span>Loading...</span>
              </template>
               -->
            </suspense>
          </el-form-item>
        </div>
        <!-- [记住我]复选框 -->
        <el-form-item label="">
          <!-- 
            label 属性为选中对象的值，只有在 checkbox-group 或者梆定对象类型为 array 时有效 
            true-label 属性表示选中时的值，类型只能是 string / number
            false-label 属性表示没有选中时的值，类型只能是 string / number
          -->
          <el-checkbox
            v-model="formData.rememberMe"
            :label="true"
            :true-label="1"
            :false-label="0"
            >记住我</el-checkbox
          >
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item label="">
          <el-button type="primary" :style="{ width: '100%' }" @click="login"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
// 引入 vue3 所需函数
import { ref, reactive, getCurrentInstance, defineAsyncComponent } from 'vue'

// 引入访问通过 app.config.globalProperties.var1 定义的全局属性，访问方法 proxy.var1
const { proxy } = getCurrentInstance()

// 引入密码加密函数 md5
import md5 from 'js-md5'

// 引入 vue-cookies 模块
import VueCookies from 'vue-cookies'

// 方法一：引入 router 路由设置，以便使用路由方法 router.push('/home') 跳转页面：
import router from '@/router/index.js'
// 方法二：引入 router 路由设置，以便使用路由方法 router.push('/home') 跳转页面：
// import { useRouter } from 'vue-router'
// const router = useRouter()

// 引入 pinia 定义的 userStore 状态管理模块
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()
// userStore.$persist() // 手动持久化 pinia store 中定义的 state 数据到本地存储，首次的初始化数据需手动同步持久化
// userStore.$hydrate() // 手动提取 storage 中的数据，默认会自动提取的
// console.log('userStore:', userStore)

// 导入异步组件
const hmYzm = defineAsyncComponent(() => import('@/components/hm-yzm.vue'))

/************** 属性数据定义区域 - start **************/
// 定义 Element-Plus 表单组件梆定的对象数据
const formData = reactive({
  account: '',
  password: '',
  checkCode: '',
  rememberMe: false,
})

// 定义 hm-yzm 组件传过来的当前验证码
let receiveChkCode = ref('')

// 获取表单 ref 名字
const formDataRef = ref()

// 定义表单校验规则
const rules = {
  account: [
    {
      required: true,
      type: 'string',
      message: '请输入用户名',
    },
  ],
  password: [
    {
      required: true,
      type: 'string',
      message: '请输入密码',
    },
  ],
  checkCode: [
    {
      required: true,
      type: 'string',
      message: '请输入验证码',
    },
    {
      // 检查输入的验证码是否正确
      validator(rule, value, callback) {
        if (value.toLowerCase() !== receiveChkCode.toLowerCase()) {
          return callback(new Error('验证码不正确'))
        } else {
          callback()
        }
      },
    },
  ],
}
/************** 属性数据定义区域 - end **************/

/************** 函数方法定义区域 - start **************/

// 进入页面的初始化函数：读取 cookies 填充登录表单
const init = () => {
  const loginInfo = VueCookies.get('loginInfo')
  // 如果没有 loginInfo 该键值 cookie，则直接返回
  if (!loginInfo) return

  // 否则，如果有，将 cookie 填充到登录表单
  Object.assign(formData, loginInfo) // 用于将 loginInfo 对象中的属性覆盖或追加到 formData 对象中
}
// 每次进入登录页面都执行一下
init()
// 登录按钮处理函数
const login = () => {
  formDataRef.value.validate(async (valid, chkItem) => {
    // 如果输入的验证码不正确，则重新生成新的验证码
    /* if (chkItem.checkCode && chkItem.checkCode[0].message === '验证码不正确') {
      proxy.$refs.myYzm.getYzm()
      return (formData.checkCode = '')
    } */

    // 如果有任何一项表单验证规则不通过，则停止执行
    if (!valid) return

    // 先保存密码框加密前的密码，登录失败后，复原为原密码，避免登录失败时，循环用加密后的密码加密
    let tmpPassword = formData.password

    // 读取之前登录成功后保存用户帐号和密码的 cookie 键 loginInfo
    let cookieLoginInfo = VueCookies.get('loginInfo')
    let cookiePassword =
      cookieLoginInfo === null ? null : cookieLoginInfo.password // 如果 cookie 不存在，会返回 null
    // 如果 cookie 保存的密码与密码输入框的密码不同（即之前没只保存过密码到cookie，cookieLoginInfo === null的情况），
    // 则输入框的密码用 md5 加密再提交
    if (formData.password !== cookiePassword) {
      formData.password = md5(formData.password)
    }

    // 发起登录验证请求
    const result = await proxy.Request({
      url: '/login',
      params: {
        account: formData.account,
        password: formData.password,
      },
    })
    // console.log('/api/login接口返回的数据是：', result)

    // 登录失败后，复原为原密码，避免登录失败时，循环用加密后的密码加密，并重新生成验证码
    if (!result) {
      return (formData.password = tmpPassword)
      // formData.checkCode = ''
      // return proxy.$refs.myYzm.getYzm()
    }

    // 如果登录验证成功，保存填写的帐号和密码到本地 cookie
    if (result.code === 200) {
      const loginInfo = {
        account: formData.account,
        password: formData.password,
        rememberMe: formData.rememberMe,
      }
      // pinia store 保存 userInfo 并持久化到 cookie
      userStore.$patch({ user: result.data })
      // console.log('Login success userStore.user', userStore.user)
      // 并保存用户信息到全局变量中，以便其它组件使用，proxy对象是响应式，不能直接用赋值方法，或可以用：
      // const instance = getCurrentInstance()  // 这个不能在函数内，要放在函数外或 setup() 函数一层
      // instance.appContext.config.globalProperties.userInfo = result.data  // 全局属性值更改后，只能用 proxy 获取，不能用 ctx 获取

      // 如果勾选了“记住我”复选框，保存用户的登录帐号和密码到 cookies
      if (formData.rememberMe) {
        VueCookies.set('loginInfo', loginInfo, '7d') // '7d'，表示保存7天
      } else {
        // 否则，如果没有勾选“记住我",则删除登录信息 cookie
        VueCookies.remove('loginInfo')
      }

      // 判断用户状态：status=1 为启用状态，才能登录
      if (result.data.status == 1) {
        // 登录成功提示
        proxy.Message.success('登录成功')

        // 登录成功后跳转页面
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        // 状态异常提示
        proxy.Message.error('用户当前状态异常或已被禁用')
      }
    }
  })
}

// 获取验证码函数
const getYzm = (val) => {
  receiveChkCode = val
  console.log('hm-yzm 传过来的验证码是：', receiveChkCode)
}
/************** 函数方法定义区域 - end **************/
</script>

<style lang="scss" scoped>
.login-body {
  position: relative;
  width: 100%;
  height: calc(100vh);
  background-image: url('../assets/login-bg.jpg');
  background-size: cover;
  background-position: center;

  .login-panel {
    width: 350px;
    background-color: rgba(255, 255, 255, 0.8);
    position: absolute;
    top: 30%;
    right: 100px;
    transform: translateY(-30%);
    padding: 20px;
    border-radius: 5px;
    box-shadow: 2px 2px 10px #ddd;

    .login-title {
      font-size: 20px;
      text-align: center;
      margin-bottom: 10px;
    }

    .checkcode-box {
      width: 100%;
      display: flex;

      .checkcode-input {
        flex: 1;
        margin-right: 5px;
      }

      .checkcode-img {
        width: 120px;
        height: 36px;
        cursor: pointer;
      }
    }
  }
}
</style>