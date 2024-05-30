<template>
  <div>
    <el-button type="danger" @click="showEdit('add')">新增分类</el-button>
    <Table :columns="columns" :showPagination="false" :dataSource="tableData" :fetch="loadDataList"
      :options="tableOptions">
      <!-- 分类缩略图列的插槽内容，这是cover插槽传过来的 row 和 index 属性，
      {row, index} 是解构赋值，也可以用 #cover="obj"，使用时用 obj.row -->
      <template #cover="{ row, index }">
        <Cover :cover="row.cover"></Cover>
      </template>

      <!-- 操作列插槽内容 -->
      <template #op="{ row, index }">
        <div class="op">
          <a href="javascript:void(0)" @click="showEdit('update', row)">修改</a>
          <el-divider direction="vertical"></el-divider>
          <a href="javascript:void(0)" @click="deleteCategory(row)">删除</a>
          <el-divider direction="vertical"></el-divider>
          <a href="javascript:void(0)" :class="[index === 0 ? 'not-allowed' : '']" @click="changeSort('up', index)">上移</a>
          <el-divider direction="vertical"></el-divider>
          <a href="javascript:void(0)" :class="[index === tableData.list.length - 1 ? 'not-allowed' : '']"
            @click="changeSort('down', index)">下移</a>
        </div>
      </template>
    </Table>
    <Dialog :title="dialogConfig.title" :show="dialogConfig.show" :showClose="dialogConfig.showClose"
      :showCancel="dialogConfig.showCancel" :buttons="dialogConfig.buttons" :cancel="dialogConfig.btnCancel">
      <!-- 将新建/编辑分类的表单结构传递给 Dialog 组件的默认插槽 -->
      <div class="blog-cates-form-box">
        <el-form :model="formData" :rules="rules" ref="formDataRef">
          <!-- 分类ID输入框（只读并隐藏，用于提交后台判断是新增还是修改分类） -->
          <el-form-item prop="categoryId" label="ID" :style="{ display: 'none' }">
            <el-input v-model="formData.categoryId" maxlength="16" :disabled="true" />
          </el-form-item>
          <!-- 分类名称输入框 -->
          <el-form-item prop="categoryName" label="名称">
            <el-input v-model="formData.categoryName" placeholder="请输入分类名称" maxlength="16" ref="focusInput" v-focus
              @blur="inputCateNameBlur = false">
            </el-input>
          </el-form-item>

          <!-- 封面图上传框 -->
          <el-form-item prop="cover" label="封面">
            <CoverUpload v-model="formData.cover" ref="coverUploadRef"></CoverUpload>
          </el-form-item>

          <!-- 分类简介 -->
          <el-form-item prop="categoryDesc" label="简介">
            <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" v-model="formData.categoryDesc"
              placeholder="请输入分类简介">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, reactive, provide } from 'vue'
import VueCookies from 'vue-cookies'
const { proxy } = getCurrentInstance()

// 导入 Cover 缩略图组件
import Cover from '@/components/Cover.vue'

// 导入 Dialog 对话框组件
import Dialog from '@/components/Dialog.vue'

// 导入 上传 组件
import CoverUpload from '@/components/CoverUpload.vue'

// 定义 api 接口 url
const api = {
  loadDataList: '/category/loadAllCategoryBlog',
  saveCategory: '/category/save',
  deleteCategory: '/category/delete',
  changeSort: '/category/changeSort',
}

// 表格数据列属性设置
const columns = [
  {
    label: '封面', // 表格列标题
    prop: 'cover', // 和返回的数据库表字段名必须要一致，才能正确渲染数据到表格
    width: 100, // 列宽度
    scopedSlots: 'cover', // 在 Table 组件中的插槽名字
  },
  {
    label: '名称',
    prop: 'categoryName',
    width: 200,
  },
  {
    label: '简介',
    prop: 'categoryDesc',
  },
  {
    label: '博客数量',
    prop: 'blogCount',
    width: 100,
  },
  {
    label: '操作',
    prop: 'op',
    width: 200,
    scopedSlots: 'op',
  },
]

const tableData = reactive({})
const tableOptions = {
  extHeight: 10,
}

// 分类表单配置部分
const formData = reactive({})

// 表单验证规则配置
const rules = {
  categoryName: [
    {
      required: true,
      message: '请输入分类名称',
    },
  ],
}

// 发起 api 请求获取博客分类表数据
const loadDataList = async () => {
  const result = await proxy.Request({
    url: api.loadDataList,
  })

  // 以下两行注释掉，否则当分类表无数据时，读取失败报错
  // if (!result) return
  // console.log('categories:', result.data)

  tableData.list = result && result.data ? result.data : []
}

// refs 组件及节点引用声明，只能用 ref()，不能用 reactive() 声明
const formDataRef = ref()

/***** 新建/修改博客分类对话框 - start *****/
// 传给【新增/修改】博客分类对话框组件 Dialog 的配置参数
const dialogConfig = reactive({
  title: '标题',
  show: false,
  showCancel: true,
  showClose: true,
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: async () => {
        formDataRef.value.validate(async (valid) => {
          // 表单验证不通过，直接中止执行
          if (!valid) return

          // 删除分类名称、分类简介前后空白字符
          formData.categoryName = formData.categoryName
            ? formData.categoryName.trim()
            : formData.categoryName
          formData.categoryDesc = formData.categoryDesc
            ? formData.categoryDesc.trim()
            : formData.categoryDesc

          // 如果是新增分类操作，检查分类名称是否已经存在
          if (!formData.categoryId) {
            let isExists = tableData.list.some((item) => {
              if (item.categoryName === formData.categoryName) {
                return true
              }
              return false
            })
            if (isExists) {
              return proxy.Message.warning(
                `分类名称【${formData.categoryName}】已经存在`
              )
            }
          }

          // 检查封面图片是否有更改，如有，先上传图片
          let findRes = false
          let formCover = proxy.$refs.coverUploadRef.cover_src.replace(
            proxy.globalInfo.imageUrl,
            ''
          )
          formCover = formCover === '' ? null : formCover //必须把''替换为null，因为以下循环item.cover只会有null比较
          if (formData.categoryId) {
            findRes = tableData.list.find((item, index, arr) => {
              if (
                item.categoryId === formData.categoryId &&
                item.cover !== formCover
              ) {
                return true
              }
              return false
            })
          }

          // 检查当前的分类名称，分类简介是否有改变
          let categoryIsChange = tableData.list.some((item, index) => {
            if (
              formData.categoryId == item.categoryId &&
              (formData.categoryName !== item.categoryName ||
                formData.categoryDesc !== item.categoryDesc)
            ) {
              return true
            }
            return false
          })

          // 如果是新增分类并且新增时选择了图片，或是修改分类但图片已变更，则上传图片
          if ((!formData.categoryId && formCover) || findRes) {
            proxy.$refs.coverUploadRef.uploadImage()
          } else if (!categoryIsChange && formData.categoryId) {
            // 否则分类信息没有更改，并且是修改记录是才提示
            return proxy.Message.warning('分类信息没有变化，请先更改，再提交！')
          } else {
            // 否则发起只修改分类名称和简介的请求，不用上传图片

            // 获取用户cookie信息，获取 user_id传到后端
            let userInfo = VueCookies.get('userInfo')

            const postData = {
              user_id: userInfo.user_id,
              category_id: formData.categoryId,
              category_name: formData.categoryName,
              category_desc: formData.categoryDesc,
              category_type: 0,
            }
            // 发起只修改分类名称和简介的请求，不用上传图片
            const result = await proxy.Request({
              url: api.saveCategory,
              params: {
                // 必须转为 json 字符串，否则node后端接收不到
                data: JSON.stringify(postData),
              },
            })
            // 如果修改成功
            if (result.code === 200) {
              if (formData.categoryId) {
                proxy.Message.success('数据修改成功！')
                // Array.prototype.some()方法 return true 即终止循环
                // 更新表格行对应的分类数据
                tableData.list.some((item) => {
                  if (item.categoryId == formData.categoryId) {
                    Object.assign(item, formData)
                    dialogConfig.show = false
                    return true
                  }
                })
              } else {
                proxy.Message.success('数据新增成功！')
                // 重载刷新加载表格数据
                loadDataList()
                // 关闭分类编辑框
                dialogConfig.show = false
              }
            }
          }
        })
      },
    },
  ],
  // Dialog对话框组件取消按钮事件函数：隐藏对话框
  btnCancel: () => {
    dialogConfig.show = false
    console.log('在父组件内关闭对话框')
  },
})

// 分类名称输入框失去焦点事件 blur 控制参数
// 如果不在分类名称输入框添加 @blur 事件，并更改此值，
// 则点击其它输入框，v-focus 指令函数会一直使分类名称输入框
// 获得焦点，其它输入框无法获得焦点会输入内容
let inputCateNameBlur = ref(true)

// 自定义标签指令：这是<script setup> 语法糖的格式，如果不使用语法糖，
// 而使用 setup() 组合式函数的话，要在 setup(),后通过 directives:{}选项进行注册
// 指令名必须以 v+驼峰大写字母开头，如 vFocus，标签内使用 v-focus
// 【注意】经测试，当 el-input 组件作为插槽的一部分，会后出现渲染的，为其标签添加
// :autofocus="true" 属性无效的，要在如下通过自定义指定在 updated
// 勾子中获得焦点才行，在mounted勾子也不行
const vFocus = {
  updated: (el) => {
    // console.log('el:', el)
    if (inputCateNameBlur.value === true) {
      el.querySelector('input').focus()
    }
  },
}

// 显示表单对话框事件函数
function showEdit(type, data = null) {
  // 显示分类表单编辑框
  dialogConfig.show = true
  proxy.$nextTick(() => {
    // 重置或清空新增/修改分类表单的数据
    formDataRef.value.resetFields()
    proxy.$refs.coverUploadRef.clearModelValue()
    // 设置编辑框标题
    if (type === 'add') {
      dialogConfig.title = '新增分类'
    } else if (type === 'update') {
      dialogConfig.title = '编辑分类'
      Object.assign(formData, data)
    }
  })
}

// 删除分类信息处理函数
const deleteCategory = async (cateItem) => {
  let res = await proxy.Msgbox.confirm(
    `确定要删除【${cateItem.categoryName}】分类吗？`,
    '删除提示'
  )

  // 点击确定按钮后，发起后端删除请求操作的函数
  if (res === 'confirm') {
    let user_id = VueCookies.get('userInfo').user_id
    const result = await proxy.Request({
      url: api.deleteCategory,
      params: {
        user_id,
        category_id: cateItem.categoryId,
      },
    })

    if (!result) return

    if (result && result.code == 200) {
      proxy.Message.success('数据删除成功')
      // 重新向后端拉取刷新表格的分类数据
      loadDataList()
    }
  }
}

// 表格分类行数据的上移/下移排序操作函数
async function changeSort(sortType, index) {
  const tmpCateList = tableData.list
  // 移动位，down下移，索引向后移一位，up上移，索引前移一位
  let offset = sortType === 'down' ? 1 : -1
  //先保存要删除再添加进表格数组来实现位移的分类数据
  let tmpCate = tmpCateList[index]
  // 先删除
  tmpCateList.splice(index, 1)
  // 再添加移动后的新位置
  tmpCateList.splice(index + offset, 0, tmpCate)

  // 将排序后的数据持久化到后端库表
  const result = await proxy.Request({
    url: api.changeSort,
    params: {
      cateList: JSON.stringify(tmpCateList),
    },
  })

  if (!result) return

  if (result.code !== 200) {
    return proxy.Message.error(result.info)
  }

  // 排序成功后，重新向后端拉取加载数据（不用加载也可以，目前界面就是排序好的数据）
  // loadDataList()

  return proxy.Message.success(result.info)
}

/***** 新建/修改/删除博客分类对话框 - end *****/

/***** provide 向所有后代组件提供依赖数据 *****/
// provide/inject 必须在 setup()内顶层声明，不能在其它函数内获取，$nextTick()也不行
provide('formData', formData)
provide('dialogConfig', dialogConfig)
provide('tableData', tableData) // 测试只能传一级对象，传 tableData.list ，子组件接收不到
provide('loadDataList', loadDataList) // 提供重新加载表格数据函数 loadDataList() 给后代组件调用
</script>

<style lang="scss">
.op {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  a {
    text-decoration: none;
    // color: var(--el-table-text-color); // el-table 组件表格内容的颜色
    color: #1890ff;
  }

  a:hover {
    text-decoration: underline;
  }

  a.not-allowed {
    cursor: not-allowed;
    color: #ddd;
    text-decoration: none;
  }
}

// el-form-item 组件自带的样式名，
// 以下设置让 label 提示文字和输入样式垂直居中对齐
.el-form-item {
  display: flex;
  align-items: center;
  padding: 5px;
}
</style>