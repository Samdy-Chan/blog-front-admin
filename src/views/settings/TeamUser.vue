<template>
  <div>
    <el-form :model="searchFormData">
      <!-- el-row 标签可以用 :gutter="50"指定各列之间的间隔，
      表示padding-left: 25px; padding-right: 25px; 
      -->
      <el-row :gutter="16">
        <!-- 昵称搜索输入框 -->
        <!-- span表示宽度列数，最大24 -->
        <el-col :span="6">
          <el-form-item prop="nickNameFuzzy" label="昵称">
            <el-input
              v-model="searchFormData.nickNameFuzzy"
              placeholder="请输入昵称"
              @keyup.enter="loadDataList('reload')"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <!-- 手机号搜索输入框 -->
        <el-col :span="6">
          <el-form-item prop="phoneFuzzy" label="手机号">
            <el-input
              v-model="searchFormData.phoneFuzzy"
              placeholder="请输入手机号"
              @keyup.enter="loadDataList('reload')"
            >
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-button type="danger" @click="loadDataList">搜索</el-button>
          <el-button
            v-if="userInfo.role_type == 1"
            type="success"
            @click="showEdit('add')"
            >新增成员</el-button
          >
        </el-col>
      </el-row>
    </el-form>
    <!-- 表格组件属性：
  columns: 列及其属性设置
  showPagination: 是否显示分页
  fetch：自动执行获取数据源的函数
  dataSource: 数据源数组对象
   -->
    <Table
      :columns="columns"
      :showPagination="true"
      :dataSource="tableData"
      :fetch="loadDataList"
      :options="tableOptions"
    >
      <template #avatar="{ index, row }">
        <Cover :cover="row.avatar"></Cover>
      </template>

      <template #userInfo="{ index, row }">
        <div>昵&nbsp;&nbsp;&nbsp;&nbsp;称：{{ row.nickName }}</div>
        <div>手机号：{{ row.phone }}</div>
        <div>职&nbsp;&nbsp;&nbsp;&nbsp;业：{{ row.profession }}</div>
      </template>

      <template #editorTypeInfo="{ index, row }">
        <div>
          {{ row.editorType == 0 ? 'HTML' : 'Markdown' }}
        </div>
      </template>

      <template #roleInfo="{ index, row }">
        <div>{{ row.roleType == 1 ? '管理员' : '普通用户' }}</div>
      </template>

      <template #statusInfo="{ index, row }">
        <div>
          <span :style="{ color: row.status == 1 ? 'green' : 'red' }">{{
            row.status == 1 ? '启用' : '禁用'
          }}</span>
        </div>
      </template>

      <template #timeInfo="{ index, row }">
        <div>
          创建时间：{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
        <div>
          最后登录时间：{{
            row.lastLoginTime
              ? dayjs(row.lastLoginTime).format('YYYY-MM-DD HH:mm:ss')
              : '无'
          }}
        </div>
      </template>

      <template #operation="{ index, row }">
        <span v-if="userInfo.role_type == 1">
          <a
            href="javascript:void(0)"
            @click="showEdit('update', row)"
            class="a-link"
            >修改</a
          >
          <el-divider direction="vertical" />
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="updateUserStatus(row)"
          >
            {{ row.status == 0 ? '启用' : '禁用' }}
          </a>
          <el-divider direction="vertical" />
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="showUpdatePwd(row.userId)"
            >修改密码</a
          >
          <el-divider direction="vertical" />
          <a href="javascript:void(0)" class="a-link" @click="delUser(row)"
            >删除</a
          >
        </span>
        <span v-else>--</span>
      </template>
    </Table>

    <!--新增成员弹窗-->
    <Dialog
      :show="editDialogInfo.show"
      :title="editDialogInfo.title"
      :buttons="editDialogInfo.buttons"
      :width="'50%'"
      :cancel="editDialogInfo.btnCancel"
      @close="editDialogInfo.show = false"
    >
      <el-form
        ref="editFormRef"
        :model="formData"
        :rules="rules"
        label-width="110px"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input
                :maxLength="20"
                placeholder="请输入昵称(20字以内)"
                v-model="formData.nickName"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input
                :maxLength="11"
                placeholder="请输入手机号(11个数字)"
                v-model="formData.phone"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10" v-if="!formData.userId">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formData.password"
                :maxLength="16"
                placeholder="请输入密码(8-16个字符)"
                type="password"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="再次输入密码" prop="rePassword">
              <el-input
                v-model="formData.rePassword"
                :maxLength="16"
                placeholder="请再次输入密码(两次需相同)"
                type="password"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="默认编辑器" prop="editorType">
              <el-radio-group v-model="formData.editorType">
                <el-radio :label="1">Markdown编辑器</el-radio>
                <el-radio :label="0">富文本编辑器</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职业" prop="profession">
              <el-input maxlength="30" v-model="formData.profession" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="头像" prop="avatar">
              <blog-cover-upload v-model="formData.avatar"></blog-cover-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="简介" prop="introduction">
              <editor-html
                id="introduction"
                ref="introduction"
                :height="300"
                v-model="formData.introduction"
              >
              </editor-html>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </Dialog>
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
            :rules="rules2"
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

<script setup>
// 导入 vue3 api
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'

// 导入所需的自定义组件
import Dialog from '@/components/Dialog.vue'
import BlogCoverUpload from '@/components/BlogCoverUpload.vue'
import EditorHtml from '@/components/EditorHtml.vue'

// 导入日期时间格式化工具包
import dayjs from 'dayjs'
// 引入密码加密函数 md5
import md5 from 'js-md5'

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

// 解构 proxy 对象
const { proxy } = getCurrentInstance()

// 当前登录用户信息
const userInfo = userStore.user

// 搜索表单数据模型
const searchFormData = reactive({})

const tableData = reactive({
  pageNo: 1, // 分页显示赋初值页码（必须设置，否则报错），后续点击分页器会自动更改页码，不用再手工操作
  pageSize: 5, // 分页显示赋初值每页记录页（必须设置，否则报错），后续点击分页器的  n条/页，会自己更改，不用再手工操作
  totalCount: 0, // 总记录数赋初值，必须赋值，否则不显示分页组件，每次请求获取数据时，后端返回
})
const tableOptions = {
  extHeight: 60,
}

// 表格数据列属性设置
const columns = [
  {
    label: '头像',
    prop: 'avatar',
    width: 80,
    scopedSlots: 'avatar',
  },
  {
    label: '用户信息',
    prop: 'nickName',
    scopedSlots: 'userInfo',
  },
  {
    label: '默认编辑器',
    prop: 'editorType',
    scopedSlots: 'editorTypeInfo',
    width: 100,
  },
  {
    label: '角色',
    prop: 'roleType',
    scopedSlots: 'roleInfo',
    width: 80,
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: 'statusInfo',
    width: 80,
  },
  {
    label: '时间',
    prop: 'createTime',
    scopedSlots: 'timeInfo',
    width: 280,
  },
  {
    label: '操作',
    prop: 'operation',
    width: 250,
    scopedSlots: 'operation',
  },
]

// 定义后台数据 api
const api = {
  loadDataList: '/settings/loadUser',
  saveUser: '/settings/saveUser',
  chkNicknameExists: '/settings/chkNicknameExists',
  chkPhoneExists: '/settings/chkPhoneExists',
  updateUserStatus: '/settings/updateUserStatus',
  updatePassword: '/user/updatePassword',
}

// 加载博客成员表格数据方法
const loadDataList = async (e) => {
  // 判断是否点击了[搜索]按钮，重置 tableData.pageNo 页码为 1，否则会显示页码错误和后端判断异常
  // el-button 组件的 target 是一个 span，span.innerText 属性就是按钮的文字
  // ?. 是 es2019 新增的 undefined/null 值链式传导符，如果 e 为 undefined 或 null，返回 undefined，
  // 不会再执行以下的属性判断，避免读取属性出错，相当于 if(e && e.target && e.target.innerText)
  // 如果是点击搜索按钮和添加博客的操作，需要重置页码和记录数，让后端返回记录数和重新计算显示页码
  if (e?.target?.innerText === '搜索' || e === 'reload') {
    tableData.pageNo = 1
    tableData.totalCount = 0
  }
  // 将请求参数封装到 data 对象里，方便后端直接用 req.body.data 解构赋值方式获取参数值
  const params = {
    data: JSON.stringify({
      pageNo: tableData.pageNo, // 当前页，分页必传
      pageSize: tableData.pageSize, // 每页记录数，分页必传，因为分页组件界面可选择更改每页记录数
      totalCount: tableData.totalCount, // 每次都会传给后端，如果不是第一次请求数据要重新计算总记录数，后端原样返回
    }),
  }

  // 每次发起请求时，都将搜索参数附加到请求参数里，因为[搜索]按钮也共用此 loadDataList() 请求数据函数，
  // 如果不在搜索列表框选择过淲属性，默认表单模型 searchFormData 相应属性值为 undefined 或 空串 ''，
  // 未在搜索表单输入过内容，搜索项属性值为 undefined，输入后又清空，值为空串 ''
  // 交由后端判断是否需要过淲，undefined 或 空串，表示搜索该项的所有数据
  Object.assign(params, searchFormData)
  console.log('搜索表单各输入框的值为：', searchFormData)

  // 开始发起请求数据
  const result = await proxy.Request({
    url: api.loadDataList,
    params,
  })

  // 以下两行注释掉，否则当分类表无数据时，读取失败报错
  // if (!result) return
  // console.log('blogs:', result.data.data)

  // console.log(tableData.pageNo, tableData.pageSize)
  // console.log('result:', result)

  // 博客记录总数：必须赋值，否则界面不显示分页组件，每次都会传给后端，如果不是第一次请求数据要重新计算总记录数，后端原样返回
  tableData.totalCount = result?.data?.totalCount || 0 // 加上 ?. 无值传导符，无值返回 undefined，防止数据为空，读取属性出错

  // tableData.pageNo += 1  // 每次点击分页器，会自动增减页码，手动增减页码会错乱，要注释

  // 将请求回来的博客列表数据赋值给表格组件，如果没有返回数据，赋值为空数组
  tableData.list = result?.data?.data || []
}

// 进入组件或页面，立即自动执行的初始化操作函数
;(function init() {
  loadDataList()
})()

// 新增成员弹窗设置
const editDialogInfo = reactive({
  show: false,
  title: '新增用户',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        submitForm(e)
      },
    },
  ],
  // Dialog对话框组件取消按钮事件函数：隐藏对话框
  btnCancel: () => {
    editDialogInfo.show = false
    console.log('在父组件内关闭对话框')
  },
})

// 新增/修改成员用户表单模型对象
const formData = ref({})
// 新增/修改成员用户表单引用对象
const editFormRef = ref()

// 新增/修改成员用户表单验证规则
// 自定义重复输入密码验证规则函数
const validateRePass = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}
const rules = {
  nickName: [
    { required: true, whitespace: true, message: '昵称不能为空' },
    // 昵称输入框失去焦点，请求后端检查用户昵称是否已存在
    {
      validator: async (rule, value, callback) => {
        formData.value.nickName = formData.value.nickName.trim()
        const postData = { nickName: formData.value.nickName }
        // 请求后端检查用户昵称是否已存在
        const result = await proxy.Request({
          url: api.chkNicknameExists,
          params: {
            data: JSON.stringify(postData),
          },
        })
        if (!result) return
        // console.log('chkNicknameExists result', result)
        if (
          result?.code === 201 &&
          result.data[0].userId !== formData.value.userId
        ) {
          callback(new Error(`用户昵称 ${formData.value.nickName} 已存在`))
        }
      },
      trigger: 'blur',
    },
  ],
  editorType: [{ required: true, message: '请选择默认编辑器' }],
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
      validator: validateRePass,
      message: '两次输入的密码不一致',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: proxy.RegVerify.phone,
      trigger: 'change',
      message: '请输入正确的手机号',
    },
    // 手机号输入框失去焦点，请求后端检查用户手机号是否已存在
    {
      validator: async (rule, value, callback) => {
        formData.value.phone = formData.value.phone.trim()
        const postData = { phone: formData.value.phone }
        // 请求后端检查用户手机号是否已存在
        const result = await proxy.Request({
          url: api.chkPhoneExists,
          params: {
            data: JSON.stringify(postData),
          },
        })
        if (!result) return
        // console.log('chkPhoneExists result', result)
        if (
          result?.code === 201 &&
          result.data[0].userId !== formData.value.userId
        ) {
          callback(new Error(`用户手机号 ${formData.value.phone} 已存在`))
        }
      },
      trigger: 'blur',
    },
  ],
}

// 新增/修改成员用户处理函数
const showEdit = async (type, data) => {
  editDialogInfo.show = true
  nextTick(() => {
    editFormRef.value.resetFields()
    formData.value = {}
    if (type === 'add') {
      editDialogInfo.edit = false
      editDialogInfo.title = '新增账号'
      formData.value = {
        introduction: '',
      }
    } else {
      editDialogInfo.edit = true
      editDialogInfo.title = '修改账号'
      Object.assign(formData.value, data)
    }
  })
}

// 新增/修改成员用户，表单提交处理函数
const submitForm = (e) => {
  // console.log('e', e)
  editFormRef.value.validate(async (valid) => {
    // 表单校验不通过，直接返回，中止执行
    if (!valid) return

    // 表单校验通过，开始执行
    // 去除用户昵称、职业输入框的前后空白
    formData.value.nickName = formData.value.nickName.replace(
      /(^\s+)|(\s+$)/g,
      ''
    )
    // “职业”是可选输入框，当没输入时，formData.value.profession 为 undefined 调用 replace 会报错
    formData.value.profession = (formData.value.profession ?? '').replace(
      /(^\s+)|(\s+$)/g,
      ''
    )
    // 组装发送给后端的用户数据
    let userData = {}
    Object.assign(userData, formData.value)
    // 新增用户时，才有密码输入框，才需要加密密码
    if (!userData.userId) {
      userData.password = md5(userData.password)
    }
    // 无论是新增还是修改用户，都删除创建时间、最后登录时间字段，这两个时间由后端处理
    delete userData.createTime // delete 和 Reflect.deleteProperty 删除不存在的属性时，也会返回 true
    delete userData.lastLoginTime
    delete userData.rePassword
    // 请求后端 api 新增或修改用户数据
    const result = await proxy.Request({
      url: api.saveUser,
      params: {
        data: JSON.stringify(userData),
      },
    })
    if (!result) {
      return
    }
    editDialogInfo.show = false
    if (!userData.userId) {
      proxy.Message.success('新增成员数据成功')
    } else {
      proxy.Message.success('修改成员数据成功')
    }
    loadDataList()
  })
}

// 修改用户状态处理函数
const updateUserStatus = async (user) => {
  let status = user.status == 1 ? 0 : 1
  let statusName = user.status == 1 ? '禁用' : '启用'
  const res = await proxy.Msgbox.confirm(
    `确定要【${statusName}】用户 ${user.nickName} 吗？`
  )
  if (res === 'confirm') {
    const postData = {
      userId: user.userId,
      status,
    }
    // 请求后端修改用户状态
    const result = await proxy.Request({
      url: api.updateUserStatus,
      dataType: 'json',
      params: {
        data: postData,
      },
    })

    if (!result) return

    // 如果修改成功
    if (result?.code === 200) {
      // 直接在前端本地更新渲染用户的状态和更改时间，不用重新拉取远程数据
      user.status = status
      user.updateTime = result.data.update_time
      proxy.Message.success(`已【${statusName}】用户 ${user.nickName}`)
    }
  }
}

/************ 修改密码部分 **************/
// 传给【新增/修改】专题对话框组件 Dialog 的配置参数
const dialogConfig = reactive({
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

// 修改密码对话框表单数据模型对象
let formPassData = reactive({
  userId: null,
  password: '',
  rePassword: '',
})

// 修改密码表单 Ref 对象
const formPassDataRef = ref()

// 自定义重复输入密码验证规则函数
const validateRePass2 = (rule, value, callback) => {
  if (value !== formPassData.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

// 定义修改密码表单验证规则
const rules2 = {
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
      validator: validateRePass2,
      message: '两次输入的密码不一致',
    },
  ],
}

// 显示修改密码对话框处理函数
const showUpdatePwd = (userId) => {
  // 显示修改密码对话框
  dialogConfig.show = true
  // 保存传过来的 userId 并清空密码表单输入框及其对应表单数据模型 formPassData 中的属性值
  formPassDataRef.value.resetFields()
  formPassData = reactive({
    userId,
    password: '',
    rePassword: '',
  })
  // console.log('formPassData', formPassData)
}

// 修改密码处理函数
const updatePassword = () => {
  formPassDataRef.value.validate(async (valid, ruleObj) => {
    // 修改密码表单校验失败，直接返回
    if (!valid) {
      return
    }

    // 修改密码表单校验成功，请求后端修改密码同步入库
    const md5_password = md5(formPassData.password)
    const result = await proxy.Request({
      url: api.updatePassword,
      params: {
        userId: formPassData.userId,
        data: JSON.stringify({ password: md5_password }),
      },
    })

    // 如果密码修改成功，返回提示
    if (result.code === 200) {
      proxy.Message.success('密码修改成功')
      // 隐藏修改密码对话框
      dialogConfig.show = false
      // 清空密码表单输入框及其对应表单数据模型 formPassData 中的属性值
      formPassDataRef.value.resetFields()
      console.log('formPassData', formPassData)
    }
  })
}
</script>

<style lang="scss" scoped>
</style>