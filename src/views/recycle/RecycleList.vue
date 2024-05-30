<template>
  <div class="body">
    <div class="top-panel">
      <!-- 
            当一个表单中只有一个单行文本输入字段时， 
            浏览器应当将在此字段中按下 Enter （回车键）的行为视为提交表单的请求。 
            如果希望阻止这一默认行为，可以在 <el-form> 标签上添加 @submit.prevent。
         -->
      <el-form
        @submit.native.prevent
        :model="searchFormData"
        class="search-form"
        labelAlign="left"
      >
        <el-row :gutter="12">
          <el-col :span="6">
            <el-form-item label="标题" label-width="46px">
              <el-input
                v-model="searchFormData.titleFuzzy"
                placeholder="支持模糊搜索"
                @keyup.enter="loadDataList"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-button type="danger" @click="loadDataList">搜索</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <Table
      :columns="columns"
      :fetch="loadDataList"
      :dataSource="tableData"
      :options="tableOptions"
    >
      <template #cover="{ index, row }">
        <cover :cover="row.cover"></cover>
      </template>

      <template #blogInfo="{ index, row }">
        <div>标题：{{ row.title }}</div>
        <div>
          文章类型：{{ row.blogType == 0 ? '博客' : '专题' }}
          <el-divider direction="vertical" />
          <span>{{ row.blogType == 0 ? '分类' : '专题' }}</span
          >：{{ row.cateName || '--' }}
        </div>
        <div>作者：{{ row.nickName }}</div>
      </template>
      <!-- 操作 -->
      <template #status="{ index, row }">
        <span v-if="row.status == 1" :style="{ color: 'green' }">{{
          row.statusName
        }}</span>
        <span v-else :style="{ color: 'red' }">{{ row.statusName }}</span>
      </template>

      <template #timeInfo="{ index, row }">
        <div>
          创建时间：{{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
        <div>
          更新时间：{{
            dayjs(row.lastUpdateTime).format('YYYY-MM-DD HH:mm:ss')
          }}
        </div>
      </template>

      <template #operation="{ index, row }">
        <span>
          <a
            v-if="row.userId == user.user_id || user.role_type == 1"
            class="a-link"
            href="javascript:void(0)"
            @click="reductionBlog(row)"
            >还原</a
          >
          <span v-else>--</span>
        </span>
        <el-divider direction="vertical" />
        <span>
          <a
            v-if="row.userId == user.user_id || user.role_type == 1"
            class="a-link"
            href="javascript:void(0)"
            @click="delSpecialBlog(row)"
            >删除</a
          >
          <span v-else>--</span>
        </span>
      </template>
    </Table>
  </div>
</template>
  
<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

// 导入日期时间操作模块
import dayjs from 'dayjs'

const router = useRouter()
const { proxy } = getCurrentInstance()

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
// 如果从 userStore 中解构的属性 user 不是一个对象，则要使用 pinia 的 API storeToRefs() 将其变成响应式，
// 这样在本组件中修改 user 变量，其它任何组件访问 userStore.user 也是响应式（同步更新的），但如果 userStore.user
// 是一个对象，而不是普通变量，则不用 storeToRefs() 转成响应式，本身对象就是引用地址的
const { user } = storeToRefs(userStore)

const api = {
  loadDataList: '/blog/loadBlogRecycleList',
  delSpecialBlog: '/blog/delSpecialBlog',
  reductionBlog: '/blog/reductionBlog',
}

const tableData = reactive({
  pageNo: 1, // 分页显示赋初值页码（必须设置，否则报错），后续点击分页器会自动更改页码，不用再手工操作
  pageSize: 5, // 分页显示赋初值每页记录页（必须设置，否则报错），后续点击分页器的  n条/页，会自己更改，不用再手工操作
  totalCount: 0, // 总记录数赋初值，必须赋值，否则不显示分页组件，每次请求获取数据时，后端返回
})
const tableOptions = reactive({
  extHeight: 40,
})

const columns = [
  {
    label: '封面',
    prop: 'cover',
    width: 80,
    scopedSlots: 'cover',
  },
  {
    label: '文章信息',
    prop: 'title',
    scopedSlots: 'blogInfo',
  },
  {
    label: '编辑器',
    prop: 'editorTypeName',
    width: 100,
  },
  {
    label: '评论',
    prop: 'allowCommentTypeName',
    width: 80,
  },
  {
    label: '时间',
    prop: 'createTime',
    scopedSlots: 'timeInfo',
    width: 260,
  },
  {
    label: '操作',
    prop: 'operation',
    width: 150,
    scopedSlots: 'operation',
  },
]
const searchFormData = reactive({})

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

  // 先去除搜索标题的前后空白
  searchFormData.titleFuzzy = searchFormData.titleFuzzy
    ? searchFormData.titleFuzzy.trim()
    : ''
  const postData = {
    user_id: user.value.user_id,
    pageNo: tableData.pageNo, // 当前页，分页必传
    pageSize: tableData.pageSize, // 每页记录数，分页必传，因为分页组件界面可选择更改每页记录数
    totalCount: tableData.totalCount, // 每次都会传给后端，如果不是第一次请求数据要重新计算总记录数，后端原样返回
    titleFuzzy: searchFormData.titleFuzzy, // 模糊搜索标题输入框值
  }

  // 请求后端数据
  const result = await proxy.Request({
    url: api.loadDataList,
    dataType: 'json',
    params: {
      data: postData,
    },
  })

  // console.log('loadDataList result:', result)

  // 注释掉，否则当分类表无数据时，读取失败报错
  // if (!result) return

  // 博客记录总数：必须赋值，否则界面不显示分页组件，每次都会传给后端，如果不是第一次请求数据要重新计算总记录数，后端原样返回
  tableData.totalCount = result?.data?.totalCount || 0 // 加上 ?. 无值传导符，无值返回 undefined，防止数据为空，读取属性出错

  // tableData.pageNo += 1  // 每次点击分页器，会自动增减页码，手动增减页码会错乱，要注释

  // 将请求回来的博客列表数据赋值给表格组件，如果没有返回数据，赋值为空数组
  tableData.list = result?.data?.data || []
}

// 删除处理函数
const delSpecialBlog = async (data) => {
  const res = await proxy.Msgbox.confirm(`确认要删除【${data.title}】吗？`)

  if (res === 'confirm') {
    // 拼装要 post 给后端的数据
    const postData = {
      blogId: data.blogId,
      pBlogId: data.pBlogId,
      categoryId: data.categoryId,
    }
    // 请求后端删除数据
    const result = await proxy.Request({
      url: api.delSpecialBlog,
      dataType: 'json',
      params: {
        data: postData,
      },
    })

    if (!result) {
      return
    }

    // 删除成功
    if (result?.code === 200) {
      proxy.Message.success('删除成功')
      // 从[回收站]数据列表中删除已点击[删除]的博客/专题文章
      const index = tableData.list.findIndex((x) => x.blogId == data.blogId)
      tableData.list.splice(index, 1)
      // 删除后，列表表格的总记录数 -1
      tableData.totalCount--
    }
  }
}

//恢复博客
const reductionBlog = async (data) => {
  const res = await proxy.Msgbox.confirm(
    `确认要恢复【${data.title}】吗？恢复后博客为草稿状态！`
  )

  if (res === 'confirm') {
    const result = await proxy.Request({
      url: api.reductionBlog,
      params: {
        blogId: data.blogId,
      },
    })

    if (!result) {
      return
    }

    if (result?.code === 200) {
      proxy.Message.success('恢复成功')
      // 从[回收站]数据列表中删除已恢复的博客/专题文章
      const index = tableData.list.findIndex((x) => x.blogId == data.blogId)
      tableData.list.splice(index, 1)
      // 删除后，列表表格的总记录数 -1
      tableData.totalCount--
    }
  }
}
</script>
  
<style lang="scss" scoped></style>
  