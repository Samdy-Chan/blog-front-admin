<template>
  <div>
    <el-button type="danger" @click="showEdit('add')">新增专题</el-button>
    <el-row :gutter="10" style="margin-top: 10px">
      <el-col :span="14">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>专题</span>
            </div>
          </template>
          <div class="special-table-box">
            <Table
              ref="dataTableRef"
              :showPagination="true"
              :columns="columns"
              :dataSource="tableData"
              :fetch="loadDataList"
              :options="tableOptions"
              @rowClick="rowClick"
            >
              <!-- 专题缩略图列的插槽内容，这是cover插槽传过来的 row 和 index 属性，
      {row, index} 是解构赋值，也可以用 #cover="obj"，使用时用 obj.row -->
              <template #cover="{ row, index }">
                <Cover :cover="row.cover"></Cover>
              </template>

              <template #categoryName="{ row, index }">
                <div class="category-name-box" :title="row.categoryName">
                  {{ row.categoryName }}
                </div>
              </template>

              <template #categoryDesc="{ row, index }">
                <div class="category-desc-box" :title="row.categoryDesc">
                  {{ row.categoryDesc }}
                </div>
              </template>

              <!-- 操作列插槽内容 -->
              <template #op="{ row, index }">
                <div class="op">
                  <a
                    href="javascript:void(0)"
                    @click.stop="showEdit('update', row)"
                    >修改</a
                  >
                  <el-divider direction="vertical"></el-divider>
                  <a href="javascript:void(0)" @click="deleteCategory(row)"
                    >删除</a
                  >
                </div>
              </template>
            </Table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card class="box-card">
          <!-- 卡片头部插槽 -->
          <template #header>
            <div class="card-header">
              <span>专题文章</span>
            </div>
          </template>
          <!-- 专题博客拖拽排序提示 -->
          <div style="margin-bottom: 4px">
            <el-alert
              title="按住鼠标拖拽条目，可改变其所属位置和排序"
              type="info"
              :show-icon="true"
              :closable="false"
            ></el-alert>
          </div>
          <!-- 卡片内容默认插槽 -->
          <div class="special-blog-tree">
            <!-- el-tree 组件属性事件说明：
                props: 配置选项，指定树节点显示的文本(label)、和子节点(children)在 data 属性中定义的键名，
                  一般也是定义为 label 和 children，格式为：
                  [
                    label: 'label',
                    children: 'children',
                    class: '自定义节点类名 string | function(data: Tree, node: Node)'
                  ]
                data:  树数据定义，格式为：[id?: number; label: string; children?: Tree[]...]
                node-key: 树节点唯一标识ID，可以用于设置默认展开和选中等其它操作的节点
                default-expand-all: 是否展开所有节点，默认 false
                expand-on-click-node: 点击节点文本时是否展开节点，默认 true，为 false 点击节点图标才展开
                highlight: 是否高亮显示当前点击的节点，默认  false
                draggable: 是否允许拖拽节点，默认 false
                @node-drop: 拖拽节点事件的回调处理函数
           -->
            <el-tree
              ref="treeRef"
              class="tree-panel"
              :props="treeProps"
              :data="blogList"
              node-key="blogId"
              :default-expand-all="true"
              :expand-on-click-node="true"
              :highlight-current="true"
              :draggable="true"
              :allow-drop="beforeDragAction"
              @node-drop="blogDrag"
            >
              <!-- 插入 el-tree 默认插槽内容 -->
              <template #default="{ node, data }">
                <span class="custom-node-style">
                  <span class="node-title" :title="data.title">
                    <!-- 草稿显示红色标题 -->
                    <span
                      v-if="data.status == 0"
                      :style="{ color: 'red', 'font-size': '13px' }"
                    >
                      {{
                        data.title.length < 7
                          ? data.title
                          : data.title.substring(0, 7) + '...'
                      }}
                      <span class="blog-status-tips">[草稿]</span>
                    </span>
                    <!-- 已发布显示绿色标题 -->
                    <span
                      v-else
                      :style="{ color: 'green', 'font-size': '13px' }"
                    >
                      {{
                        data.title.length < 7
                          ? data.title
                          : data.title.substring(0, 7) + '...'
                      }}
                    </span>
                  </span>
                  <span class="node-op">
                    <template v-if="data.blogId === '0'">
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click.stop="editBlog('add', data)"
                        >新增文章</a
                      >
                    </template>
                    <template v-else>
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click.stop="showDetail(data)"
                        >预览</a
                      >
                      <el-divider direction="vertical" />
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click.stop="editBlog('update', data)"
                        v-if="
                          userStore.user.user_id == data.userId ||
                          userStore.user.role_type == 1
                        "
                        >修改</a
                      >
                      <span v-else>--</span>
                      <el-divider direction="vertical" />
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click.stop="deleteBlog(data)"
                        v-if="
                          userStore.user.user_id == data.userId ||
                          userStore.user.role_type == 1
                        "
                        >删除</a
                      >
                      <span v-else>--</span>
                      <el-divider direction="vertical" />
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click.stop="editBlog('add', data)"
                        >新增下级文章</a
                      >
                    </template>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
        <el-form :model="formData" :rules="rules" ref="formDataRef">
          <!-- 专题ID输入框（只读并隐藏，用于提交后台判断是新增还是修改专题） -->
          <el-form-item
            prop="categoryId"
            label="ID"
            :style="{ display: 'none' }"
          >
            <el-input
              v-model="formData.categoryId"
              maxlength="16"
              :disabled="true"
            />
          </el-form-item>
          <!-- 专题名称输入框 -->
          <el-form-item prop="categoryName" label="名称">
            <el-input
              v-model="formData.categoryName"
              placeholder="请输入专题名称"
              maxlength="30"
              ref="focusInput"
              v-focus
              @blur="inputCateNameBlur = false"
            >
            </el-input>
          </el-form-item>

          <!-- 封面图上传框 -->
          <el-form-item prop="cover" label="封面">
            <CoverUpload
              :categoryType="1"
              v-model="formData.cover"
              ref="coverUploadRef"
            ></CoverUpload>
          </el-form-item>

          <!-- 专题简介 -->
          <el-form-item prop="categoryDesc" label="简介">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 4 }"
              v-model="formData.categoryDesc"
              placeholder="请输入专题简介"
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </Dialog>
    <!-- 专题博客文章编辑组件 -->
    <SpecialBlogEdit ref="specialBlogEditRef"></SpecialBlogEdit>
    <!-- 点击[预览]弹出的预览博客内容窗口组件 -->
    <SpecialBlogDetail ref="specialBlogDetailRef"></SpecialBlogDetail>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, reactive, provide, nextTick } from 'vue'
const { proxy } = getCurrentInstance()

// 导入 Cover 缩略图组件
import Cover from '@/components/Cover.vue'

// 导入 Dialog 对话框组件
import Dialog from '@/components/Dialog.vue'

// 导入 上传 组件
import CoverUpload from '@/components/CoverUpload.vue'

// 导入专题博客编辑组件
import SpecialBlogEdit from '@/views/special/SpecialBlogEdit.vue'

// 导入专题博客预览组件
import SpecialBlogDetail from '@/views/special/SpecialBlogDetail.vue'

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

// 定义 api 接口 url
const api = {
  loadSpecialList: '/category/loadSpecialList',
  saveCategory: '/category/save',
  deleteCategory: '/category/delete',
  getSpecialInfo: '/blog/getSpecialInfo',
  deleteBlog: '/blog/delete',
  updateSpecialBlogSort: 'blog/updateSpecialBlogSort',
}

/******** 专题树及节点功能部分 - start ********/
// 专题树节点键定义
const treeProps = {
  label: 'title',
  children: 'children',
  // class: 'node-style',  // 为每个节点设置css样式名
  // value: 'blogId',
}

// 专题所属的博客文章列表
const blogList = reactive([])

// 保存当前选中的专题行数据，用于在子组件 SpecialBlogEdit 的 autoSave 函数中使用
let currentSpecial = ref({})
// 获取当前点击专题的文章：el-table 组件点击当前行回调回传三个参数
const rowClick = (row, column, event) => {
  loadBlogList(row)
}

// 点击当前节点，获取当前专题节点博客文章的处理函数
const loadBlogList = async (row) => {
  // 保存当前选中的专题行数据，用于在子组件 SpecialBlogEdit 的 autoSave 函数中使用
  currentSpecial.value = row

  let result = await proxy.Request({
    url: api.getSpecialInfo,
    params: {
      data: JSON.stringify({
        userId: userStore.user.user_id,
        categoryId: row.categoryId,
      }),
    },
  })

  // 905为没找到数据，这里也要做处理
  if (result?.code === 200 || result?.code === 905) {
    // console.log('result.data', result.data)

    // 再把本专题分类（父记录：即在 blog_category.category_type = 1 的记录）附加到树状父子对象的最顶层，
    // 以便在专题详情右侧树状栏顶部显示父专题
    const parentData = {
      blogId: '0',
      pBlogId: null,
      title: row.categoryName,
      categoryId: row.categoryId,
      userId: row.userId,
    }
    // 如果后端返回905代码，是没有数据的，要为数组赋初值为空数组，这样就算专题下没有文章，也显示上面默认的父专题标题
    if (result?.code === 905) {
      result.data = []
    }
    result.data.unshift(parentData)
    // console.log('result.data', result.data)

    // 调用自定义工具函数 buildParentChildObj 构建符合树状的父子记录对象
    const specialTreeData = proxy.Tools.buildParentChildObj(
      result.data,
      'blogId',
      'pBlogId',
      'children'
    )

    console.log('specialTreeData', specialTreeData)
    // 将以上组装处理后的树状父子数据赋值给 el-tree 组件使用的渲染变量 blogList
    blogList.splice(0, blogList.length) // 先清空数组之前的所有数据，再执行以下 Object.assign 赋值
    Object.assign(blogList, specialTreeData)
    // console.log('blogList', blogList)
  }
}
/******** 专题树及节点功能部分 - end ********/

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
    width: 120,
    scopedSlots: 'categoryName',
  },
  {
    label: '简介',
    prop: 'categoryDesc',
    scopedSlots: 'categoryDesc',
  },
  {
    label: '文章数量',
    prop: 'blogCount',
    width: 100,
  },
  {
    label: '操作',
    prop: 'op',
    width: 100,
    scopedSlots: 'op',
  },
]

// 表格组件梆定数据源
const tableData = reactive({
  pageNo: 1, // 分页显示赋初值页码（必须设置，否则报错），后续点击分页器会自动更改页码，不用再手工操作
  pageSize: 5, // 分页显示赋初值每页记录页（必须设置，否则报错），后续点击分页器的  n条/页，会自己更改，不用再手工操作
  totalCount: 0, // 总记录数赋初值，必须赋值，否则不显示分页组件，每次请求获取数据时，后端返回
  list: [],
})
// 表格组件属性设置
const tableOptions = {
  extHeight: 110,
}

// 专题表单配置部分
const formData = reactive({})

// 表单验证规则配置
const rules = {
  categoryName: [
    {
      required: true,
      whitespace: true,
      message: '请输入专题名称',
    },
  ],
  categoryDesc: [
    {
      required: true,
      whitespace: true,
      message: '请输入专题简介',
    },
  ],
}

// 发起 api 请求获取分类专题表数据
const loadDataList = async (type) => {
  // 如果是添加博客的操作，即 reload，需要重置页码和记录数，让后端返回记录数和重新计算显示页码
  if (type === 'reload') {
    tableData.pageNo = 1
    tableData.totalCount = 0
  }
  const result = await proxy.Request({
    url: api.loadSpecialList,
    params: {
      data: JSON.stringify({
        categoryType: 1, // 1：专题分类
        pageNo: tableData.pageNo, // 当前页，分页必传
        pageSize: tableData.pageSize, // 每页记录数，分页必传，因为分页组件界面可选择更改每页记录数
        totalCount: tableData.totalCount, // 每次都会传给后端，如果不是第一次请求数据要重新计算总记录数，后端原样返回
      }),
    },
  })

  console.log('result.data', result.data)

  // 博客记录总数：必须赋值，否则界面不显示分页组件，每次都会传给后端，如果不是第一次请求数据要重新计算总记录数，后端原样返回
  tableData.totalCount = result?.data?.totalCount || 0 // 加上 ?. 无值传导符，无值返回 undefined，防止数据为空，读取属性出错

  // 就算没有返回数据，都要赋初值为空数组，否则渲染表格时报错
  tableData.list = result?.data.data ?? []

  // 如果返回数据，默认触发选中第一行
  if (result?.code === 200) {
    nextTick(() => {
      // setCurrentRow方法是 el-table 表格组件选中指定行的方法，参数值为 row
      // 测试官方说用 row 作为参数，不行，故注释
      // proxy.$refs.dataTableRef.setCurrentRow(tableData.list[1])
      // 用唯一键才可以
      proxy.$refs.dataTableRef.setCurrentRow(
        'categoryId',
        tableData.list[0].categoryId
      )
      // 触发专题行点击事件，以便显示右侧的[专题文章]数据
      loadBlogList(tableData.list[0])
    })
  }
}

// refs 组件及节点引用声明，只能用 ref()，不能用 reactive() 声明
const formDataRef = ref()

/***** 新建/修改博客专题对话框 - start *****/
// 传给【新增/修改】专题对话框组件 Dialog 的配置参数
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

          // 删除专题名称、专题简介前后空白字符
          formData.categoryName = formData.categoryName
            ? formData.categoryName.trim()
            : formData.categoryName
          formData.categoryDesc = formData.categoryDesc
            ? formData.categoryDesc.trim()
            : formData.categoryDesc

          // 如果是新增专题操作，检查专题名称是否已经存在
          if (!formData.categoryId) {
            let isExists = tableData.list.some((item) => {
              if (item.categoryName === formData.categoryName) {
                return true
              }
              return false
            })
            if (isExists) {
              return proxy.Message.warning(
                `专题名称【${formData.categoryName}】已经存在`
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

          // 检查当前的专题名称，专题简介是否有改变
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

          // 如果是新增专题并且新增时选择了图片，或是修改专题但图片已变更，则上传图片
          if ((!formData.categoryId && formCover) || findRes) {
            proxy.$refs.coverUploadRef.uploadImage()
          } else if (!categoryIsChange && formData.categoryId) {
            // 否则专题信息没有更改，并且是修改记录是才提示
            return proxy.Message.warning('专题信息没有变化，请先更改，再提交！')
          } else {
            // 否则发起只修改专题名称和简介的请求，不用上传图片

            const postData = {
              user_id: userStore.user.user_id,
              category_id: formData.categoryId,
              category_name: formData.categoryName,
              category_desc: formData.categoryDesc,
              category_type: 1, // 分类类型，0：博客分类，1：专题分类
            }
            // 发起只修改专题名称和简介的请求，不用上传图片
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
                // 更新表格行对应的专题数据
                tableData.list.some((item) => {
                  if (item.categoryId == formData.categoryId) {
                    Object.assign(item, formData)
                    dialogConfig.show = false
                    return true
                  }
                })
                // 重新加载该专题下的所有专题博客文章，以同步显示右侧[专题文章]列表最顶层的修改后新的专题名称
                loadBlogList(currentSpecial.value)
              } else {
                proxy.Message.success('数据新增成功！')
                // 重载刷新加载表格数据，需传 reload 重置页码为1和重新计算记录数
                loadDataList('reload')
                // 关闭专题编辑框
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

// 专题名称输入框失去焦点事件 blur 控制参数
// 如果不在专题名称输入框添加 @blur 事件，并更改此值，
// 则点击其它输入框，v-focus 指令函数会一直使专题名称输入框
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
  // 显示专题表单编辑框
  dialogConfig.show = true
  proxy.$nextTick(() => {
    // 重置或清空新增/修改专题表单的数据
    formDataRef.value.resetFields()
    proxy.$refs.coverUploadRef.clearModelValue()
    // 设置编辑框标题
    if (type === 'add') {
      dialogConfig.title = '新增专题'
    } else if (type === 'update') {
      dialogConfig.title = '编辑专题'
      Object.assign(formData, data)
    }
  })
}

// 删除专题信息处理函数
const deleteCategory = async (cateItem) => {
  let res = await proxy.Msgbox.confirm(
    `确定要删除【${cateItem.categoryName}】专题吗？`,
    '删除提示'
  )

  // 点击确定按钮后，发起后端删除请求操作的函数
  if (res === 'confirm') {
    let user_id = userStore.user.user_id
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
      // 重新向后端拉取刷新表格的专题数据
      loadDataList('reload')
    }
  }
}

/***** 新建/修改/删除博客专题对话框 - end *****/

/***** 新建/修改/删除专题博客部分 - start *****/
// 获取专题博客文件编辑器组件对象ref
const specialBlogEditRef = ref()

// 新增/修改专题博客处理函数
const editBlog = (type, data) => {
  specialBlogEditRef.value.init(type, data)
}

// 删除专题博客处理函数
const deleteBlog = async (row) => {
  let title =
    row.title.length > 15 ? row.title.substring(0, 15) + '...' : row.title

  if (row.children) {
    return await proxy.Msgbox.alert(
      `【${title}】该专题博客下还有其它博客，不能删除！`
    )
  }

  let res = await proxy.Msgbox.confirm(
    `确定要删除标题为【${title}】这条专题博客吗？`
  )
  if (res === 'confirm') {
    let result = await proxy.Request({
      url: api.deleteBlog,
      params: {
        data: JSON.stringify({
          userId: userStore.user.user_id,
          blogId: row.blogId,
        }),
      },
    })
    // 如果删除成功，删除界面表格列表的相应条目，并更新总记录数
    if (result?.code === 200) {
      proxy.Message.success('数据删除成功')

      // 不能使用这个，如果当前删除的是 children 数组里的最后一个，删除后还是存在 children 属性，再删除其父节点，还是会报
      // 父节点下还有其它节点，导致不能删除空的父节点，改用以下 loadBlogList  重新远程加载显示可解决
      // proxy.Tools.deleteObjInArray(row.blogId, blogList)

      // 请求后端重新加载当前专题下的文章列表数据
      loadBlogList(currentSpecial.value)

      // 将专题列表表格当前专题的[文章数量]列减1
      currentSpecial.value.blogCount--
    }
  }
}

// 拖拽条目到目标位置前的处理函数（比拖拽成功事件 @node-drop 先执行）：不能拖拽到最顶节点
const beforeDragAction = (draggingNode, dropNode, dropType) => {
  // console.log('beforeDragAction', draggingNode, dropNode, dropType)
  if (
    draggingNode.level === 1 ||
    (dropNode.level === 1 && dropType !== 'inner')
  ) {
    return false
  }
  return true
}

// 修改拖拽条目父级及其拖拽后的所有同级条目的排序操作函数
// 拖拽后，el-tree 组件界面会立即产生条目拖拽后的位置，但还需api后端更改库表排序同步变化
const blogDrag = async (draggingNode, dropNode, dropType, ev) => {
  //拖入某个节点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
  let parentNode = null
  if (dropType == 'inner') {
    //拖入某个几点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
    parentNode = dropNode
  } else {
    //拖入之前，之后，修改被拖动的节点的父节点为目标节点的父节点，同时修改目标节点父节点下所有的子节点的排序
    parentNode = dropNode.parent
  }
  // 还要更改拖拽节点的 pBlogid
  draggingNode.data.pBlogId = parentNode.data.blogId

  //操作的节点ID
  const blogId = draggingNode.data.blogId
  const pBlogId = parentNode.data.blogId
  //需要重新排序的博客ID
  const blogIds = []
  parentNode.childNodes.forEach((element, index) => {
    // el-tree 组件界面实时更改拖拽后条目所有同级条目的sort排序字段
    element.data.sort = index

    blogIds.push({
      blogId: element.data.blogId,
      pBlogId: element.data.pBlogId,
      sort: index,
    })
  })
  // console.log(blogId, blogIds)
  // 调试输出观察：约711行已经更改拖拽节点的 pBlogid，及约720行界面已经修改了同级条目sort排序字段后的数据
  console.log(draggingNode, dropNode, dropType)

  // 组装提交后端对象数据
  const postData = {
    blogId,
    pBlogId,
    blogIds,
  }

  // 向后端发起拖拽条目及其拖拽后的所有同级条目的排序操作
  const result = await proxy.Request({
    url: api.updateSpecialBlogSort,
    params: { data: JSON.stringify(postData) },
  })

  if (!result) {
    return
  }

  //重新加载文章树，以上约711行已经更改拖拽节点的 pBlogid，及约720行已经修改了同级条目sort排序字段，可以不用于重新加载文章树
  // loadBlogList(currentSpecial.value)
}
/***** 新建/修改/删除专题博客部分 - end *****/

/***** 预览专题博客部分 *****/
const specialBlogDetailRef = ref()
const showDetail = (data) => {
  const detailRef = specialBlogDetailRef.value
  detailRef.windowConfig.show = true
  detailRef.blogList.splice(0, detailRef.blogList.length)
  Object.assign(detailRef.blogList, blogList)
  nextTick(() => {
    detailRef.showDetail(data)
  })
}

/***** provide 向所有后代组件提供依赖数据 *****/
// provide/inject 必须在 setup()内顶层声明，不能在其它函数内获取，$nextTick()也不行
provide('formData', formData)
provide('dialogConfig', dialogConfig)
provide('tableData', tableData) // 测试只能传一级对象，传 tableData.list ，子组件接收不到
provide('loadDataList', loadDataList) // 提供重新加载表格数据函数 loadDataList() 给后代组件调用

// 向外显露数据或方法
defineExpose({
  loadBlogList,
  currentSpecial,
  editBlog,
})
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

/***** el-card 组件及插槽内容样式 *****/
.el-card__body {
  padding: 10px !important;
}

.special-table-box {
  // 专题分类表格的分类名称、分类描述列多于两行显示省略号设置
  .category-name-box,
  .category-desc-box {
    width: 100%;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

/***** el-tree 组件及插槽内容样式 *****/
.tree-panel {
  // 专题文章树状盒子设置到屏幕底部的高度
  height: calc(100vh - 266px);
  overflow: auto;

  .custom-node-style {
    flex: 1;
    display: flex;
    justify-content: space-between;

    .node-title {
      span {
        // 专题文章标题颜色
        color: #333 !important;
        font-size: 14px;

        .blog-status-tips {
          color: #999 !important;
          font-size: 12px;
        }
      }
    }

    .node-op {
      font-size: 13px;
    }
  }

  .a-link {
    color: #1890ff;
    text-decoration: none;
  }
}
</style>