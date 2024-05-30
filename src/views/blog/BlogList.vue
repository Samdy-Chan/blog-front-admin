<template>
  <div class="top-panel">
    <el-form :model="searchFormData">
      <!-- el-row 标签可以用 :gutter="50"指定各列之间的间隔，
      表示padding-left: 25px; padding-right: 25px; 
      -->
      <el-row :gutter="16">
        <!-- 博客标题搜索输入框 -->
        <!-- span表示宽度列数，最大24 -->
        <el-col :span="6">
          <el-form-item prop="titleFuzzy" label="标题">
            <el-input
              v-model="searchFormData.titleFuzzy"
              placeholder="请输入博客标题"
              @keyup.enter="loadDataList('reload')"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <!-- 博客状态选择列表框 -->
        <el-col :span="5">
          <el-form-item prop="status" label="状态">
            <!-- clearable: 鼠标移到下拉选择箭头时，是否显示清空按选项钮，
            默认 false，只用于单选项才有效
             -->
            <el-select
              v-model="searchFormData.status"
              :clearable="true"
              placeholder="请选择状态"
            >
              <el-option :value="0" label="草稿"></el-option>
              <el-option :value="1" label="已发布"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 博客分类选择列表框 -->
        <el-col :span="5">
          <el-form-item prop="categoryId" label="分类">
            <!-- clearable: 鼠标移到下拉选择箭头时，是否显示清空按选项钮，
            默认 false，只用于单选项才有效
             -->
            <el-select
              v-model="searchFormData.categoryId"
              :clearable="true"
              placeholder="请选择分类"
            >
              <el-option
                v-for="(item, index) in categoryList"
                :key="index"
                :value="item.categoryId"
                :label="item.categoryName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-button type="danger" @click="loadDataList">搜索</el-button>
          <el-button type="success" @click="showEdit('add')"
            >新增博客</el-button
          >
        </el-col>
      </el-row>
    </el-form>
  </div>
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
    <!-- 博客封面缩略图，这是cover插槽传过来的 row 和 index 属性，
      {row, index} 是解构赋值，也可以用 #cover="obj"，使用时用 obj.row -->
    <template #cover="{ row, index }">
      <Cover :cover="row.cover"></Cover>
    </template>
    <!-- 文章信息 -->
    <template #blogInfo="{ row, index }">
      <div class="blogInfo">
        <div class="title" :title="row.title">标题：{{ row.title }}</div>
        <div>分类：{{ row.categoryName }}</div>
        <div>作者：{{ row.nickName }}</div>
      </div>
    </template>
    <!-- 编辑器 -->
    <template #editorTypeName="{ row, index }">
      <div class="editorTypeName">
        {{ row.editorType == 0 ? 'HTML' : 'Markdown' }}
      </div>
    </template>
    <!-- 类型 -->
    <template #typeName="{ row, index }">
      <div class="typeName">
        <div>类型：{{ row.type == 1 ? '原创' : '转载' }}</div>
        <div v-if="row.type == 0" :title="row.reprintUrl">
          转载地址：{{ row.reprintUrl }}
        </div>
      </div>
    </template>
    <!-- 评论 -->
    <template #allowCommentTypeName="{ row, index }">
      <div class="allowCommentTypeName">
        {{ row.allowComment == 0 ? '不允许' : '允许' }}
      </div>
    </template>
    <!-- 状态 -->
    <template #statusName="{ row, index }">
      <span v-if="row.status == 0" :style="{ color: 'red' }">草稿</span>
      <span v-else-if="row.status == 1" :style="{ color: 'green' }"
        >已发布</span
      >
      <span v-else :style="{ color: 'red' }">未知</span>
    </template>
    <!-- 时间 -->
    <template #timeName="{ row, index }">
      <div class="timeName">
        <div>
          创建时间：{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
        <div>
          更新时间：{{
            !row.updateTime
              ? '无'
              : dayjs(row.updateTime).format('YYYY-MM-DD HH:mm:ss')
          }}
        </div>
      </div>
    </template>
    <!-- 操作 -->
    <template #op="{ row, index }">
      <div class="op">
        <a href="javascript:void(0)" @click="showEdit('update', row)">修改</a>
        <el-divider direction="vertical"></el-divider>
        <a href="javascript:void(0)" @click="deleteBlog(row)">删除</a>
        <el-divider direction="vertical"></el-divider>
        <a href="javascript:void(0)" @click="showDetail(row.blogId)">预览</a>
      </div>
    </template>
  </Table>
  <!-- 博客文章编辑器弹出框组件 -->
  <BlogEdit ref="blogEditRef"></BlogEdit>
  <!-- 点击[预览]弹出的预览博客内容窗口组件 -->
  <BlogDetail ref="blogDetailRef"></BlogDetail>
</template>

<script setup>
import { getCurrentInstance, ref, reactive, nextTick } from 'vue'
import dayjs from 'dayjs'
import BlogEdit from '@/views/blog/BlogEdit.vue'
import BlogDetail from '@/views/blog/BlogDetail.vue'

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

const { proxy } = getCurrentInstance()

// 点击[预览]博客的处理函数
const showDetail = (blogId) => {
  proxy.$refs.blogDetailRef.windowConfig.show = true
  proxy.$refs.blogDetailRef.showDetail(blogId)
}

// 定义 api url
const api = {
  loadCategory: '/category/loadAllCategoryForBlog',
  loadDataList: '/blog/loadBlog',
  deleteBlog: '/blog/delete',
}

// 表单模型数据梆定
const searchFormData = reactive({})

// 保存搜索分类列表数据
const categoryList = reactive([])
/**
 * 进入组件后，立即执行初始化函数
 *
 */
;(function init() {
  // 获取博客分类名，填充到搜索栏下拉列表
  loadCategoryList()

  // 获取用户所有博客数据，这个注释即可，不用手动调用，因为在 <Table> 组件的 fetch 属性中
  // 指定了该函数，进入页面会自动调用 loadDataList()，不要重复调用
  // loadDataList()
})()

/**************** 搜索栏功能部分 - start ****************/
/**
 * 加载获取分类列表数据，以填充分类列表选择框的处理函数
 */
async function loadCategoryList() {
  const result = await proxy.Request({
    url: api.loadCategory,
  })

  if (!result) return

  if (result && result.code === 200) {
    Object.assign(categoryList, result.data)
    // console.log('categoryList:', categoryList)
  }
}
/**************** 搜索栏功能部分 - end ****************/

// 表格数据列属性设置
const columns = [
  {
    label: '封面', // 表格列标题
    prop: 'cover', // 和返回的数据库表字段名必须要一致，才能正确渲染数据到表格
    width: 80, // 列宽度
    scopedSlots: 'cover', // 在 Table 组件中的插槽名字
  },
  {
    label: '文章信息',
    prop: 'blogInfo',
    width: 200,
    scopedSlots: 'blogInfo',
  },
  {
    label: '编辑器',
    prop: 'editorTypeName',
    width: 120,
    scopedSlots: 'editorTypeName',
  },
  {
    label: '类型',
    prop: 'typeName',
    width: 150,
    scopedSlots: 'typeName',
  },
  {
    label: '评论',
    prop: 'allowCommentTypeName',
    width: 80,
    scopedSlots: 'allowCommentTypeName',
  },
  {
    label: '状态',
    prop: 'statusName',
    width: 80,
    scopedSlots: 'statusName',
  },
  {
    label: '时间',
    prop: 'timeName',
    width: 230,
    scopedSlots: 'timeName',
  },
  {
    label: '操作',
    prop: 'op',
    width: 120,
    scopedSlots: 'op',
  },
]

// 删除博客处理函数
async function deleteBlog(row) {
  let title =
    row.title.length > 15 ? row.title.substring(0, 15) + '...' : row.title
  let res = await proxy.Msgbox.confirm(
    `确定要删除标题为【${title}】这条博客数据吗？`
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
      tableData.list.forEach((item, index, _this) => {
        if (item.blogId == row.blogId) {
          _this.splice(index, 1)
        }
      })
      tableData.totalCount -= 1
    }
  }
}

// 显示编辑框处理函数
async function showEdit(type = 'add', row = null) {
  // 先停止自动保存定时器，避免引起数据混乱
  clearInterval(proxy.$refs.blogEditRef.timer)

  // 显示编辑器窗口
  proxy.$refs.blogEditRef.windowConfig.show = true

  // 如果是新增博客
  if (type === 'add') {
    proxy.$refs.blogEditRef.dialogConfig.title = '新增文章'
    nextTick(() => {
      // 将编辑器恢复显示为用户的默认编辑器
      proxy.$refs.blogEditRef.currentEditor = userStore.user.editor_type
    })

    // 之前点击过旧的博客修改按钮，才清空，新增博客，退出后，再进入仍保留方便编辑
    if (proxy.$refs.blogEditRef.blogFormData.blogId) {
      proxy.$refs.blogEditRef.clearFormData()
    }

    // 首次或离开重返页面后，点击[新增博客]后，检查本地缓存是否有保存之前未提交的博客，有则提示加载
    if (
      !proxy.$refs.blogEditRef.blogFormData.title &&
      (!proxy.$refs.blogEditRef.blogFormData.content ||
        !proxy.$refs.blogEditRef.blogFormData.markdownContent)
    ) {
      if (window.localStorage) {
        const storage = window.localStorage
        let blogObj = storage.getItem('blogId_null')
        if (blogObj) {
          let res = await proxy.Msgbox.confirm(
            '本地缓存中已存在上一次新建的但未提交的数据！\n确定要加载上一次的数据吗？'
          )
          if (res === 'confirm') {
            blogObj = JSON.parse(blogObj)
            delete blogObj.saveTime // 要删除 saveTime，否则当提交到后端库表没有此字段，会报错
            Object.assign(proxy.$refs.blogEditRef.blogFormData, blogObj)
          }
        }
      }
    }
  }

  // 如果是修改博客信息，把要修改的博客条目信息加载到编辑器表单和博客详细设置表单中
  if (type === 'update') {
    // 先清除上一次显示的编辑表单数据
    proxy.$refs.blogEditRef.clearFormData()

    proxy.$refs.blogEditRef.dialogConfig.title = '修改文章'

    // 从点击的博客条目 row 中解构获取需要的字段数据并添加编辑器表单、博客详细设置对话框表单的模型数据中
    let {
      blogId,
      title,
      content,
      markdownContent,
      categoryId,
      cover,
      type,
      editorType,
      reprintUrl,
      allowComment,
      summary,
      tag,
    } = row
    const blogFormData = {
      blogId,
      title,
      content,
      markdownContent,
      categoryId,
      cover,
      type,
      editorType,
      reprintUrl,
      allowComment,
      summary,
      tag,
    }
    Object.assign(proxy.$refs.blogEditRef.blogFormData, blogFormData)
    // 由于在上面每次显示编辑窗口的时候，都会调用 clearFormData() 函数删除 blogCoverUploadRef 引用组件内的
    // 保存预览图片路径的 cover_src 变量的值，所以这里要再次手动为其设置图片路径，否则在第二次修改同一博客时，
    // 博客设置对话框显示不了预览图片
    proxy.$refs.blogEditRef.$refs.blogCoverUploadRef.cover_src =
      blogFormData.cover

    // 检查博客条目是否有保存在本地缓存中
    if (window.localStorage) {
      const storage = window.localStorage
      let blogObj = storage.getItem('blogId_' + blogId)
      // console.log('blogId', blogId, blogObj)
      // 如果博客条目有保存在本地缓存中，则提示是否需要加载
      if (blogObj) {
        let res = await proxy.Msgbox.confirm(
          '本地缓存中已存在该博客上一次修改但未提交的数据！\n确定要加载上一次的数据吗？'
        )
        // 如果点击了[确定]加载按钮，则加载缓存数据到编辑表单中
        if (res === 'confirm') {
          blogObj = JSON.parse(blogObj)
          delete blogObj.saveTime // 要删除 saveTime，否则当提交到后端库表没有此字段，会报错
          Object.assign(proxy.$refs.blogEditRef.blogFormData, blogObj)
          // 由于在上面每次显示编辑窗口的时候，都会调用 clearFormData() 函数删除 blogCoverUploadRef 引用组件内的
          // 保存预览图片路径的 cover_src 变量的值，所以这里要再次手动为其设置图片路径，否则在第二次修改同一博客时，
          // 加载缓存数据后，博客设置对话框显示不了预览图片
          proxy.$refs.blogEditRef.$refs.blogCoverUploadRef.cover_src =
            blogObj.cover
        }
      }
    }
  }

  // 调用定时自动保存博客信息到本地 localStorage 的处理函数
  proxy.$refs.blogEditRef.autoSave(type, row)
}

const tableData = reactive({
  pageNo: 1, // 分页显示赋初值页码（必须设置，否则报错），后续点击分页器会自动更改页码，不用再手工操作
  pageSize: 5, // 分页显示赋初值每页记录页（必须设置，否则报错），后续点击分页器的  n条/页，会自己更改，不用再手工操作
  totalCount: 0, // 总记录数赋初值，必须赋值，否则不显示分页组件，每次请求获取数据时，后端返回
})
const tableOptions = {
  extHeight: 60,
}

/******** 发起 api 请求获取博客文章数据 - start ********/
// 进入页面自动执行，及[搜索]按钮共用的请求数据函数 loadDataList()
async function loadDataList(e) {
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
      user_id: userStore.user.user_id,
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
  // console.log('搜索表单各输入框的值为：', searchFormData)

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

  // 如果有返回数据，将评论标签字段 tag，由|线分隔的字符串转换为数组，才能在编辑博客的详细设置对话中正确显示评论标签
  if (result?.data?.data?.length > 0) {
    result.data.data.forEach((item) => {
      item.tag = item.tag ? item.tag.split('|') : []
    })
  }

  // 博客记录总数：必须赋值，否则界面不显示分页组件，每次都会传给后端，如果不是第一次请求数据要重新计算总记录数，后端原样返回
  tableData.totalCount = result?.data?.totalCount || 0 // 加上 ?. 无值传导符，无值返回 undefined，防止数据为空，读取属性出错

  // tableData.pageNo += 1  // 每次点击分页器，会自动增减页码，手动增减页码会错乱，要注释

  // 将请求回来的博客列表数据赋值给表格组件，如果没有返回数据，赋值为空数组
  tableData.list = result?.data?.data || []
}
/******** 发起 api 请求获取博客文章数据 - end ********/

// 向外暴露数据和方法
defineExpose({
  loadDataList,
})
</script>

<style lang="scss" scoped>
.blogInfo,
.typeName,
.timeName {
  font-size: 13px;

  div {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

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
}
</style>