<template>
  <div>
    <el-form ref="formDataRef" :model="formData" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="11">
          <!-- 头像上传组件 -->
          <el-form-item label="头像" prop="avatar" text-align="center">
            <BlogCoverUpload v-model="formData.avatar"></BlogCoverUpload>
          </el-form-item>
          <!-- 昵称输入框 -->
          <el-form-item label="昵称" prop="nickName">
            <el-input
              v-model="formData.nickName"
              maxlength="20"
              placeholder="请输入昵称"
            ></el-input>
          </el-form-item>
          <!-- 手机号输入框 -->
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="formData.phone"
              maxlength="11"
              placeholder="请输入手机号"
            ></el-input>
          </el-form-item>
          <!-- 修改密码链接提示 -->
          <el-form-item label="密码">
            <a href="javascript:void(0);" class="a-link" @click="showUpdatePwd"
              >修改密码</a
            >
          </el-form-item>
          <!-- 默认编辑器单选钮 -->
          <el-form-item label="默认编辑器" prop="editorType">
            <el-radio-group v-model="formData.editorType">
              <el-radio :label="0">HTML编辑器</el-radio>
              <el-radio :label="1">Markdown编辑器</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 职业输入框 -->
          <el-form-item label="职业" prop="profession">
            <el-input
              v-model="formData.profession"
              maxlength="30"
              placeholder="请输入职业"
            ></el-input>
          </el-form-item>
          <!-- 保存按钮 -->
          <el-form-item label="" label-width="80px">
            <el-button
              type="danger"
              @click="saveMyInfo(formData.userId as number)"
              >保存</el-button
            >
          </el-form-item>
        </el-col>

        <el-col :span="13" class="editor-box-el">
          <!-- 个人简介编辑器 -->
          <div class="introduction-box">
            <span class="el-form-item__label">个人简介</span>
            <el-form-item prop="introduction">
              <editor-html v-model="formData.introduction" :height="392">
              </editor-html>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 修改密码对话框自定义组件 -->
    <div class="update-password-dialog">
      <Dialog
        :title="dialogConfig.title"
        :show="dialogConfig.show"
        :showClose="dialogConfig.showClose"
        :showCancel="dialogConfig.showCancel"
        :buttons="dialogConfig.buttons"
        :cancel="dialogConfig.btnCancel"
      >
        <!-- 将新建/编辑专题的表单结构传递给 Dialog 组件的默认插槽 -->
        <div class="blog-cates-form-box">
          <el-form
            :model="formPassData"
            :rules="rules"
            ref="formPassDataRef"
            label-width="auto"
            label-position="right"
          >
            <!-- 密码输入框（只读并隐藏，用于提交后台判断是新增还是修改专题） -->
            <el-form-item prop="password" label="密码">
              <el-input
                type="password"
                v-model="formPassData.password"
                placeholder="请输入密码"
                maxlength="16"
              />
            </el-form-item>
            <!-- 重复密码输入框 -->
            <el-form-item prop="rePassword" label="重复密码">
              <el-input
                type="password"
                v-model="formPassData.rePassword"
                placeholder="请再次输入密码"
                maxlength="16"
              />
            </el-form-item>
          </el-form>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, getCurrentInstance } from 'vue'

import BlogCoverUpload from '@/components/BlogCoverUpload.vue'
import EditorHtml from '@/components/EditorHtml.vue'
import Dialog from '@/components/Dialog.vue'

// 导入本页面/组件的 TS 类型声明文件
import type {
  IFormData,
  FGetUserInfo,
  IApi,
  IFormPassData,
  FSaveMyInfo,
} from '#/types/MyInfo'
// 导入公共的 TS 类型声明文件
import type { IRetResult, IDialogConfig } from '#/types/Common'

// 导入 element-plus 的内置的 TS 声明类型
import type { /* FormInstance, */ FormRules } from 'element-plus'

// 引入修改密码的 md5 加密模块包
import { md5 } from 'js-md5'

// 导入 cookies 操作模块包
import VueCookies from 'vue-cookies'

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

const { proxy } = getCurrentInstance() as any

// 使用 element-plus 内置表单类型声明表单 Ref 对象
// 修改个人信息表单 Ref 对象
// const formDataRef = ref<FormInstance>()  // element-plus 方式，访问时.value后面要加?号formDataRef.value.?
const formDataRef = ref()
// 修改密码表单 Ref 对象
const formPassDataRef = ref()

// 用户个信息表单数据模型对象
const formData = reactive<IFormData>({
  userId: null,
  nickName: '',
  avatar: '',
  phone: '',
  editorType: 0,
  profession: '',
  introduction: '',
})

// 修改密码对话框表单数据模型对象
const formPassData = reactive<IFormPassData>({
  password: '',
  rePassword: '',
})

// 定义二次密码校验函数
const validateRepass = (rule: any, value: any, callback: Function) => {
  if (value !== formPassData.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

// 定义表单校验规则，多个表单规则可以定义在一起，只要表单 model 属性名不同即可
// 这里定义了修改个人信息表单formData 和 修改密码formPassData 两个表单的规则
const rules: FormRules = {
  nickName: [
    {
      required: true,
      message: '请输入昵称',
      whitespace: true,
      trigger: 'blur',
    },
  ],
  editorType: [{ type: 'number', required: true, message: '请选择默认编辑器' }],
  password: [
    { required: true, message: '请输入密码' },
    {
      validator: proxy.RegVerify.password,
      message: '密码8-16位，只能是字母/数字/下划线(_)',
    },
  ],
  rePassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: validateRepass,
      message: '两次输入的密码不一致',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: proxy.RegVerify.phone,
      message: '请输入11位正确的手机号',
    },
  ],
  profession: [{ required: true, message: '请输入职业', whitespace: true }],
  /* introduction: [
    { required: true, message: '请输入个人简介 ', whitespace: true },
    {
      validator(rule: any, value: any, callback: Function) {
        let introdContent = proxy.Tools.removeHtmlTag(value).replace(
          /^((\s*&nbsp;\s*)|(\s))*$/g,
          ''
        )
        if (introdContent === '') {
          proxy.Msgbox.alert(rule.message)
          return callback(new Error(rule.message))
        }
        callback()
      },
      message: '个人简介不能为空！',
      trigger: 'blur',
    },
  ], */
}

// 定义 api
const api: IApi = {
  getUserInfo: '/user/getUserInfo',
  updateUserInfo: '/user/updateUserInfo',
  updatePassword: '/user/updatePassword',
}

// 保存上次修改的数据，作比较，如果没有变化，不再提交修改，并提示
let prevFormData: string = ''

// 获取用户信息填充表单的函数
const getUserInfo: FGetUserInfo = async (userId: number): Promise<void> => {
  const result = await proxy.Request({
    url: api.getUserInfo,
    params: {
      userId,
    },
  })

  if (result?.code === 200) {
    // console.log('userinfo:', result)
    Object.assign(formData, result.data)
    // 保存当前获取的用户信息，用作下次提交比较，相同，则提示不再提交
    prevFormData = JSON.stringify(formData)
  }
}

// 获取用户ID
let userId = (userStore.user as any).user_id

// 初始化自执行函数
;(function init() {
  // 调用获取用户信息函数
  getUserInfo(userId)
})()

// 提交修改用户个人信息的处理函数
const saveMyInfo: FSaveMyInfo = (userId: number) => {
  formDataRef.value.validate(async (valid: boolean, ruleObj: object) => {
    if (!valid) {
      // console.log('ruleObj', ruleObj)  // 校验不通过， ruleObj 才有值，通过则为 undefined
      return
    }

    // 去除各表单域内容的前后空白
    formData.nickName = formData.nickName.trim()
    formData.phone = formData.phone.trim()
    formData.profession = formData.profession.trim()
    formData.introduction = formData.introduction.replace(
      /^((\s*&nbsp;\s*)|(\s))*$/g,
      ''
    )

    // 将目前表单的数据与上次提交的数据作比较，如果没有变化，不再提交修改，并提示
    if (JSON.stringify(formData) === prevFormData) {
      return proxy.Message.warning(
        '您的个人信息没有发生变化，请作更改后，再提交！'
      )
    }

    // 发起后端请求，修改用户信息
    const result: IRetResult = await proxy.Request({
      url: api.updateUserInfo,
      params: {
        userId,
        data: JSON.stringify(formData),
      },
    })

    if (result.code === 200) {
      proxy.Message.success('数据修改成功')
      // 保存当前表单的数据，用作下次提交比较，相同，则提示不再提交
      prevFormData = JSON.stringify(formData)
      // 实时更新 userStore.user 里的数据，会重新渲染页面，刷新用户信息
      const newUserInfoData = proxy.Tools.keyToLine(formData)
      newUserInfoData.update_time = result.data.update_time
      // userStore.user 除了有表单界面的数据，还包括里库表中所有字段的信息，
      // 所以用 Object.assign 方法只修改和表单界面一样的字段，其它字段不变
      // console.log('newUserInfoData', newUserInfoData)
      // Object.assign(userStore.user, newUserInfoData)
      // $patch方法里传对象参数，就是类似 Object.assign 一样的作用，只修改同名属性值，不删除存在的属性
      userStore.$patch({ user: newUserInfoData })
      // console.log('userStore.user:', userStore.user)
    }
  })
}

/***** 新建/修改博客专题对话框 - start *****/
// 显示修改密码对话框处理函数
const showUpdatePwd = () => {
  // 显示修改密码对话框
  dialogConfig.show = true
  // 清空密码表单输入框及其对应表单数据模型 formPassData 中的属性值
  formPassDataRef.value.resetFields()
  // console.log('formPassData', formPassData)
}

// 修改密码处理函数
const updatePassword = () => {
  formPassDataRef.value.validate(async (valid: boolean, ruleObj: object) => {
    // 修改密码表单校验失败，直接返回
    if (!valid) {
      return
    }

    // 修改密码表单校验成功，请求后端修改密码同步入库
    const md5_password = md5(formPassData.password)
    const result: IRetResult = await proxy.Request({
      url: api.updatePassword,
      params: {
        userId,
        data: JSON.stringify({ password: md5_password }),
      },
    })

    // 如果密码修改成功，返回提示
    if (result.code === 200) {
      proxy.Msgbox.alert('密码修改成功，请重新登录！')
      // 隐藏修改密码对话框
      dialogConfig.show = false
      // 清空密码表单输入框及其对应表单数据模型 formPassData 中的属性值
      formPassDataRef.value.resetFields()
      // console.log('formPassData', formPassData)
      // 清空 userStore 和 sessionStorage 和 cookie 中的用户数据，退出登录
      // userStore.$patch({ user: {} })  // $patch里使用{}，不能清空对象属性，原理应该和 Object.assign(user,{})一样
      // 用如下方法才能清空 user 对象
      // userStore.user = {}  // 或如下方法
      userStore.$patch((state) => {
        state.user = {}
      })
      // 修改密码后，需要删除自动登录的 cookie loginInfo
      ;(<any>VueCookies).remove('loginInfo')
    }
  })
}

// 传给【新增/修改】专题对话框组件 Dialog 的配置参数
const dialogConfig = reactive<IDialogConfig>({
  title: '修改密码',
  show: false,
  showCancel: true,
  showClose: true,
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: () => {
        // 调用修改密码处理函数
        updatePassword()
      },
    },
  ],
  // Dialog对话框组件取消按钮事件函数：隐藏对话框
  btnCancel: () => {
    dialogConfig.show = false
    console.log('在父组件内关闭对话框')
  },
})
</script>

<style lang="scss" scoped>
// el-form-item 组件自带的样式名，
// 以下设置让 label 提示文字和输入样式垂直居中对齐
:deep(.el-form-item) {
  display: flex;
  align-items: center;
  padding: 5px;
}

.introduction-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 
:deep(.el-col.editor-box-el) {
  height: 400px !important;
}

:deep(.editor-box div[data-w-e-textarea]) {
  height: 350px !important;
}
 */
</style>