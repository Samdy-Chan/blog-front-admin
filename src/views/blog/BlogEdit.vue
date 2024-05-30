<template>
  <div>
    <!-- 新增/修改博客内容编辑器弹窗 -->
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      @close="closeWindow"
    >
      <template #body>
        <div class="form-data-box">
          <el-form :model="blogFormData" :rules="rules" ref="blogFormDataRef">
            <!-- 博客ID输入框（只读并隐藏，用于提交后台判断是新增还是修改分类） -->
            <el-form-item prop="blogId" label="ID" :style="{ display: 'none' }">
              <el-input
                v-model="blogFormData.blogId"
                maxlength="16"
                :disabled="true"
              />
            </el-form-item>
            <!-- 分类名称输入框 -->
            <el-form-item prop="title" label="">
              <el-input
                v-model="blogFormData.title"
                :autofocus="true"
                placeholder="请输入博客标题"
              >
                <template #prepend>
                  <span style="font-weight: bold">博客标题</span>
                </template>
              </el-input>
            </el-form-item>
            <div class="tips-info-box">
              <strong>提示信息:&nbsp;</strong>
              <span class="editor-switch-tips" @click="changeEditor">
                1、点此切换使用
                {{ currentEditor === 1 ? 'HTML' : 'Markdown' }}
                编辑器（注意：切换编辑器可能会导致样式丢失）
              </span>
              <span class="autoSave-tips">
                2、当编辑数据和原数据或缓存的数据有变化的时候，每 5
                秒自动保存一次正在编辑的博客数据到本地缓存
              </span>
            </div>
            <el-form-item v-if="currentEditor === 1" prop="markdownContent">
              <!-- 自定义编辑器组件 -->
              <div style="width: 100%">
                <EditorMarkdown
                  v-model="blogFormData.markdownContent"
                  :height="editorMarkdownHeight"
                  @setHtmlContent="setHtmlContent"
                  ref="editorMarkdownRef"
                ></EditorMarkdown>
              </div>
            </el-form-item>
            <el-form-item v-else prop="content">
              <div style="width: 100%">
                <EditorHtml
                  v-model="blogFormData.content"
                  :height="editorHtmlHeight"
                  @setHtmlContent="setHtmlContent"
                  ref="editorHtmlRef"
                ></EditorHtml>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <!-- 弹出对话框 -->
        <div class="dialog-box">
          <Dialog
            :title="dialogConfig.title"
            :width="dialogConfig.width"
            :show="dialogConfig.show"
            :showClose="dialogConfig.showClose"
            :showCancel="dialogConfig.showCancel"
            :buttons="dialogConfig.buttons"
            :cancel="dialogConfig.btnCancel"
          >
            <!-- 将新建/编辑分类的表单结构传递给 Dialog 组件的默认插槽 -->
            <el-form
              :model="blogFormData"
              :rules="rules"
              ref="settingsFormDataRef"
              class="blog-setting-form"
            >
              <!-- 博客分类选择框 -->
              <el-form-item prop="categoryId" label="博客分类">
                <el-select
                  v-model="blogFormData.categoryId"
                  :clearable="true"
                  placeholder="请选择分类"
                  :style="{ width: '100%' }"
                >
                  <el-option
                    v-for="(item, index) in categoryList"
                    :key="index"
                    :value="item.categoryId"
                    :label="item.categoryName"
                  ></el-option>
                </el-select>
              </el-form-item>

              <!-- 封面图上传框 -->
              <el-form-item prop="cover" label="封面">
                <BlogCoverUpload
                  v-model="blogFormData.cover"
                  ref="blogCoverUploadRef"
                ></BlogCoverUpload>
              </el-form-item>

              <!-- 博客类型单选项 -->
              <el-form-item prop="type" label="博客类型">
                <el-radio-group v-model="blogFormData.type">
                  <el-radio :label="1">原创</el-radio>
                  <el-radio :label="0">转载</el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 博客原文地址输入框 -->
              <el-form-item
                v-if="blogFormData.type == 0"
                prop="reprintUrl"
                label="原文地址"
              >
                <el-input
                  v-model="blogFormData.reprintUrl"
                  placeholder="请输入原文地址"
                ></el-input>
              </el-form-item>

              <!-- 评论是否允许单选项 -->
              <el-form-item prop="allowComment" label="评论">
                <div class="allow-comment">
                  <el-radio-group v-model="blogFormData.allowComment">
                    <el-radio :label="1">允许</el-radio>
                    <el-radio :label="0">不允许</el-radio>
                  </el-radio-group>
                  <span class="tips"
                    >请先在评论设置里设置好相应参数，评论才会生效</span
                  >
                </div>
              </el-form-item>

              <!-- 博客摘要 -->
              <el-form-item
                prop="summary"
                label="博客摘要"
                style="display: flex; align-items: center"
              >
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 4 }"
                  v-model="blogFormData.summary"
                  placeholder="未输入摘要，会读取原文部分内容作为摘要"
                >
                </el-input>
              </el-form-item>

              <!-- 博客标签 -->
              <el-form-item prop="tag" label="博客标签">
                <div class="blog-tag-box">
                  <el-tag
                    v-for="(item, index) in blogFormData.tag"
                    :key="index"
                    type=""
                    closable
                    @close="clearTag(index)"
                    style="margin-right: 4px"
                  >
                    {{ item }}
                  </el-tag>
                  <span
                    v-if="blogFormData.tag?.length === 0"
                    class="tips"
                    style="margin: 0 6px 0 0"
                    >添加标签更容易被搜索引擎收录</span
                  >
                  <span
                    v-if="!showTagInput"
                    class="iconfont icon-add"
                    @click="showTagInput = !showTagInput"
                  ></span>
                  <!-- input的失去焦点事件 blur 和按键事件 keyup.enter 冲突，
                  keyup.enter 事件也会触发 blur 事件，按键后，导致还添加多一次空白的评论，
                  所以应该在 keyup.enter 事件中直接调用 blur 事件即可解决：
                  @keyup.enter="$event.target.blur()"
                   -->
                  <el-input
                    v-if="showTagInput"
                    class="tag-input"
                    v-model="tagInputValue"
                    placeholder="请输入标签"
                    maxLength="10"
                    @blur="tagInputResult"
                    @keyup.enter="$event.target.blur()"
                  ></el-input>
                </div>
              </el-form-item>
            </el-form>
          </Dialog>
        </div>
      </template>
    </Window>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import Window from '@/components/Window.vue'
import EditorMarkdown from '@/components/EditorMarkdown.vue'
import EditorHtml from '@/components/EditorHtml.vue'
import BlogCoverUpload from '@/components/BlogCoverUpload.vue'
import Dialog from '@/components/Dialog.vue'

// 导入日期时间格式化模块包
import dayjs from 'dayjs'

// 导入 html 转 markdown 的模块包
import TurndownService from 'turndown'

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

// 引入类 app 实例对象 proxy
const { proxy } = getCurrentInstance()

// 当前应使用哪个编辑器，默认 markdown
let currentEditor = ref(1)

/********** 勾子函数定义部分 - start **********/
onMounted(() => {
  // 获取分类列表填充到编辑文章的[博客分类]选择列表框
  loadCategoryList()
})

onUnmounted(() => {
  // 组件卸载/销毁需停止定时自动保存定时器 timer，否则切换离开页面，还会继续执行定时器
  clearInterval(timer)
})
/********** 勾子函数定义部分 - end **********/

/******** 博客内容编辑器弹出框配置部分 - start ********/
// 设置编辑器的高度
const editorMarkdownHeight = window.innerHeight - 202
const editorHtmlHeight = window.innerHeight - 282

// 编辑器博客标题、博客内容表单、及博客详细设置对话框表单的数据模型
const blogFormData = reactive({
  tag: [],
})

// 定义 api
const api = {
  loadCategory: '/category/loadAllCategoryForBlog',
  saveBlog: '/blog/save',
}

// 表单验证规则：whitespace:true 表示不允许只输入空格
const rules = {
  title: [{ required: true, message: '请输入博客标题', whitespace: true }],
  markdownContent: [
    { required: true, message: '请输入博客正文内容', whitespace: true },
  ],
  content: [
    /* 注释此预定义规则，因为预定义规则只对 <el-form-item> 标签的 prop 属性值与其包含标签的 v-model 属性名要一致才有效，
      由于以上 html 模板的包含编辑器组件的表单项标签 <el-form-item prop="content">，
      其包含了 <EditorMarkdown v-model="blogFormData.markdownContent"> 组件
      和 <EditorHtml v-model="blogFormData.content"> 组件，两个组件的 v-model 不同，所以这个预定义规则只对
      <EditorHtml v-model="blogFormData.content"> 组件有效，故干脆注释，用下面的自定义校验规则实现空值判断
     */
    { required: true, message: '请输入博客正文内容', whitespace: true },
    {
      // 自定义校验规则
      validator(rule, value, callback) {
        let content = proxy.Tools.removeHtmlTag(value).replace(
          /^((\s*&nbsp;\s*)|(\s))*$/g,
          ''
        )
        // console.log('content', content, content.length)
        if (content == '') {
          return callback(new Error('请输入博客正文内容'))
        }
        callback()
      },
    },
  ],
  categoryId: [{ required: true, message: '请选择博客分类' }],
  type: [{ required: true, message: '请选择博客类型' }],
  allowComment: [{ required: true, message: '请选择是否允许评论' }],
  reprintUrl: [
    {
      // 自定义校验规则
      validator(rule, value, callback) {
        // 如果选择转载，提示必须输入原文地址
        if (blogFormData.type == 0 && (!value || value?.trim() == '')) {
          blogFormData.reprintUrl = ''
          return callback(new Error('转载博文须输入原文地址'))
        }
        callback()
      },
    },
  ],
}

/**************** 编辑器相关配置部分 - start ****************/
// 接收编辑器组件回传事件的 html 内容
let html = ref('')
function setHtmlContent(htmlContent) {
  html.value = htmlContent
  // 判断，当使用 html 编辑器时，也把 html 内容保存到 markdown 编辑器中，反之亦然
  // 用于切换编辑器时，都能显示正在编辑的内容
  if (currentEditor.value === 0) {
    // 如果当前是 html 编辑器，通过第三方库 trundown 把 html 内容转为 markdown 保存到 blogFormData.markdownContent 中
    const turndownService = new TurndownService()
    blogFormData.markdownContent = turndownService.turndown(html.value)
    // console.log('html to markdown', blogFormData.markdownContent)
  } else {
    blogFormData.content = html.value
  }
}
/**************** 编辑器相关配置部分 - end ****************/

/**************** 弹出对话框配置部分 - start ****************/
// 保存博客分类列表
const categoryList = reactive([])

// 传给【新增/修改】博客分类对话框组件 Dialog 的配置参数
const dialogConfig = reactive({
  title: '新增文章',
  show: false,
  showCancel: true,
  showClose: true,
  width: '45%',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: () => {
        // 提交表单，发布博文
        submitBlog()
      },
    },
  ],
  // Dialog对话框组件取消按钮事件函数：隐藏对话框
  btnCancel: () => {
    dialogConfig.show = false
    console.log('在父组件内关闭对话框')
  },
})

// 传递给弹出框组件的参数配置部分
const windowConfig = reactive({
  // 是否显示编辑器弹出框
  show: false,
  // 传递点击按钮
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        // 验证编辑器博客标题和内容是否有输入
        proxy.$refs.blogFormDataRef.validate((valid) => {
          //如果表单验证不通过，直接返回
          if (!valid) return

          // 表单验证通过，才显示发布博客对话框
          showSettings()
        })
      },
    },
  ],
})

// 显示设置对话框处理函数
function showSettings() {
  dialogConfig.show = true
}
/**************** 弹出对话框配置部分 - end ****************/

// 选择列表框获取博客分类处理函数
async function loadCategoryList() {
  const result = await proxy.Request({
    url: api.loadCategory,
  })

  if (!result) return

  if (result?.code === 200) {
    // 数组常量也能用 Object.assign 追加数据
    Object.assign(categoryList, result.data)
  }
}

// [取消]按钮事件，隐藏编辑器弹出框
function closeWindow() {
  windowConfig.show = false
  // 停止自动保存定时器
  clearInterval(timer)

  // loadDataList()
}

// 删除评论标签事件处理函数
function clearTag(index) {
  blogFormData.tag.splice(index, 1)
}

// 是否显示评论标签tag输入框
let showTagInput = ref(false)

// 评论标签输入框内容
let tagInputValue = ref('')

// 评论标签输入框失去焦点或按回车键，添加评论到列表并隐藏处理函数
function tagInputResult() {
  // 先隐藏标签输入框
  showTagInput.value = false
  // 去除前后空白
  tagInputValue.value = tagInputValue.value.trim()
  //   如果是空白内容，即不添加
  if (!tagInputValue.value) {
    return
  } else if (blogFormData.tag.indexOf(tagInputValue.value) >= 0) {
    // 否则如果添加的标签在数组已经存在，则提示（返回值在数组的索引号，0为第一个，找不到返回-1）
    proxy.Message.warning(`标签[${tagInputValue.value}]已经存在，无须添加！`)
    return (tagInputValue.value = '')
  }

  blogFormData.tag.push(tagInputValue.value)
  tagInputValue.value = ''
}

// 发布博文处理函数
async function submitBlog() {
  proxy.$refs.settingsFormDataRef.validate(async (valid) => {
    // 如果表单验证不通过，直接返回
    if (!valid) return

    // 截取博客内容前50字作为博客摘要（不保存自动截取的到数据库，需要显示摘要时再动态显示）
    /* 
    // console.log('html2text:', proxy.Tools.removeHtmlTag(html.value))
    let text = proxy.Tools.removeHtmlTag(html.value)
    let summaryText = text.substring(0, 50)
    blogFormData.summary =
      text.length > 50 ? summaryText + '……' : summaryText
     */

    // 将编辑器的博客标题、博客内容表单数据，及弹出设置框的博客详细设置表单数据追加到新增/修改博客 api 请求的 data 参数
    const data = {
      editorType: currentEditor.value, // 编辑器类型：0 富文本，1 markdown
      delType: 1, //  0 删除，1 正常
      blogType: 0, // 博客类型：0 博客， 1 专题
      userId: userStore.user.user_id,
      content: html.value,
    }

    // 如果选择了[原创]，清空原文地址，避免传到后台原创类型也更新了原文地址
    if (blogFormData.type == 1) {
      blogFormData.reprintUrl = null
    }

    // 将编辑器的博客标题和博客内容表单数据，及博客详细设置数据追加到发送请求的 data 对象中
    Object.assign(data, blogFormData)

    // 发起请求新增/更新博客数据
    const result = await proxy.Request({
      url: api.saveBlog,
      params: {
        data: JSON.stringify(data),
      },
    })

    if (result.code === 200) {
      let optType = !blogFormData.blogId ? '新增' : '修改'
      proxy.Message.success(`${optType}博客数据成功`)
      // 停止自动保存定时器，并删除缓存对应条目
      clearInterval(timer)
      if (!blogFormData.blogId) {
        localStorage.removeItem('blogId_null')
      } else {
        localStorage.removeItem('blogId_' + blogFormData.blogId)
      }
      // 调用父组件 BlogList.vue 的 loadDataList 方法重新加载博客列表数据
      let loadType = !blogFormData.blogId ? 'reload' : null
      proxy.$parent?.loadDataList && proxy.$parent.loadDataList(loadType)
      // 清空编辑器和博客详细设置对话框表单域数据
      clearFormData()
      // 隐藏博客详细设置对话框窗口
      dialogConfig.show = false
      // 隐藏编辑窗口
      windowConfig.show = false
    }
  })
}

// 清空编辑器和博客详细设置对话框表单域数据处理函数
function clearFormData() {
  proxy.$refs.blogFormDataRef.resetFields()
  proxy.$refs.settingsFormDataRef.resetFields()
  // 清空博客封面预览缩略图
  proxy.$refs.blogCoverUploadRef.cover_src = ''

  // 要手动再清空这两项编辑器的内容，因为以上调用表单的 resetFields() 方法，会清空 blogFormData.blogId 的值，
  // blogFormData.blogId 是加载显示哪个编辑器的条件，会导致重新渲染编辑器组件，所以表单的 resetFields() 方法
  // 清空不了以下两个编辑器的内容，要手动清除一下，如不手动清除，可将这两个编辑器的显示条件由 v-if 改为 v-show 也可以
  blogFormData.markdownContent = ''
  blogFormData.content = ''
}

// 点击提示切换编辑器处理函数
let isChgEditor = false // 是否手动切换编辑器，用于在底部 watch 监听判断，如果是手动，则不执行监听里的操作
function changeEditor() {
  // 直接在这里更改当前编辑器即可，不用再执行监听器里的操作，否则当用户默认编辑器为 HTML(userStore.user.editor_type=0)
  // 并且新建博客时 blogFormData.blogId 为空，会执行监听器里的
  // if((!blogFormData.blogId && userStore.user.editor_type == 0) || blogFormData.editorType == 0)
  // 监听器执行后，会导致当前编辑器变量 currentEditor 永远为0，导致新建博客时无法手动切换编辑器，修改博客可以切换
  isChgEditor = true
  currentEditor.value = currentEditor.value === 0 ? 1 : 0
  blogFormData.editorType = currentEditor.value // 保存该博客当前使用的编辑器，记录到缓存和当前编辑器进行对比
}

// 定时自动保存博客信息到本地 localStorage 的处理函数
let timer = null
function autoSave(type, row = null) {
  // 如果浏览器不支持 localStorage 本地存储，则直接返回结束
  if (!window.localStorage) return
  // 为 localStorage 对象设置简短名称，方便以下操作
  const storage = window.localStorage

  timer = setInterval(async () => {
    // 调试输出缓存操作开始时间
    console.log('save start:', dayjs().format('YYYY-MM-DD HH:mm:ss'))

    // 删除博客标题和博客内容的前后空白，供以下判断，只有输入标题和内容后才进行保存
    blogFormData.title = blogFormData.title?.trim()
    let contentText = proxy.Tools.removeHtmlTag(html.value)?.replace(
      /^((\s*&nbsp;\s*)|(\s))*$/g,
      ''
    )

    // 是否需要保存当前编辑博客到本地缓存标识变量
    let needSave = false

    // 检查当前正在新增/修改的博客是否已经在本地缓存中
    let currentStorageBlog = null
    if (type === 'add') {
      currentStorageBlog = storage.getItem('blogId_null') // 找不到，返回 null
    } else {
      currentStorageBlog = storage.getItem('blogId_' + blogFormData.blogId) // 找不到，返回 null
    }
    // console.log(currentStorageBlog)
    // 获取当前修改博客的表单模型有哪些属性，用于与本地缓存和当前博客对应的表格条目 row 的属性对比
    let blogKeys = Object.keys(blogFormData)
    // console.log(blogKeys)

    // 如果本地缓存存在当前新增/修改的博客条目，编辑表单数据优先与缓存比较，没有，则与表格对应条目 row 比较
    if (currentStorageBlog) {
      // console.log('storage')
      let currentStorageBlogObj = JSON.parse(currentStorageBlog)
      let newCurrentStorageBlogObj = {}
      blogKeys.forEach((item) => {
        newCurrentStorageBlogObj[item] = currentStorageBlogObj[item]
      })
      // 如果当前编辑博客表单数据不等于本地缓存对应条目，则标记为需保存到缓存
      if (
        JSON.stringify(blogFormData) !==
          JSON.stringify(newCurrentStorageBlogObj) &&
        (blogFormData.title || contentText)
      ) {
        needSave = true
      }
    } else if (type === 'update') {
      // 否则在缓存中没有对应条目，并且只有是修改博客才和表格对应的博客条目比较
      // console.log('row')
      let newRowObj = {}
      blogKeys.forEach((item) => {
        newRowObj[item] = row[item]
      })
      // 如果当前编辑博客表单数据不等于表格对应条目，则标记为需保存到缓存
      if (
        JSON.stringify(blogFormData) !== JSON.stringify(newRowObj) &&
        (blogFormData.title || contentText)
      ) {
        needSave = true
      }
    } else if (blogFormData.title || contentText) {
      // 以上缓存中不存在条目，博客列表表格也没有对应条目，则为新增博客
      needSave = true
    }

    // 如果没有输入博客标题，并且没有输入博客内容，并且是否需要保存变量为false，直接返回，不进行以下定时保存操作
    if (!needSave) return

    // 判断本地 localStorage 存储使用率是否已经达到差不多 5M，达到则需要删除最早存储的博客条目才能继续保存
    let storageSize = JSON.stringify(storage).length
    // localStorage 能存储数据的最大容量一般为5M，这里不用1024，预留点判断空间
    if (storageSize >= 2 * 1000) {
      // 达到大小限制后，先停止本定时器，必须再保存新数据，造成混乱，点击提示的[确定]按钮后，再开启
      clearInterval(timer)
      // 获取最早一次保存的博客条目
      let item = {}
      let arrItems = []
      for (let [k, v] of Object.entries(storage)) {
        if (k.match(/^blogId/)) {
          item = JSON.parse(v)
          item.key = k
          arrItems.push(item)
        }
      }
      if (arrItems.length > 0) {
        // 按自动保存博客条目的保存时间 saveTime 升序排序
        arrItems.sort((a, b) => {
          // return a.saveTime - b.saveTime  // 数值型比较才能这样排，字符串要按如下方法比较
          if (a.saveTime > b.saveTime) {
            // 升序排序法
            return 1
          }
          return -1
        })
        // 需删除最早保存的博客条目，释放空间提示
        if (!arrItems[0].title) arrItems[0].title = '无标题' // 替换为空，避免以下读取length属性失败
        let delTitle =
          arrItems[0].title.length <= 15
            ? arrItems[0].title
            : arrItems[0].title.substring(0, 15) + '...'
        let res = await proxy.Msgbox.confirm(
          `本地存储空间已达到限制，不能再自动保存正在编辑的内容！
            点击[确定]将删除最早一次保存的博客标题为【${delTitle}】的条目 ，以释放空间！`
        )
        // 如果点击了提示的[确定]按钮
        if (res === 'confirm') {
          // 删除最早保存的博客条目，因为是按保存时间 saveTime 升序排序，所以取第一个元素的 key
          storage.removeItem(arrItems[0].key)
          // 确定删除后，再开启自动保存
          autoSave(type, row)
        } else {
          // 如果点击了提示的[取消]按钮，侧停止定时器，不再自动保存
          // clearInterval(timer)
        }
      }
    } else {
      let key = type === 'add' ? 'blogId_null' : 'blogId_' + blogFormData.blogId
      blogFormData.saveTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      blogFormData.editorType = currentEditor.value // 保存该博客当前使用的编辑器，记录到缓存和当前编辑器进行对比
      storage.setItem(key, JSON.stringify(blogFormData))
      delete blogFormData.saveTime
    }
    console.log('save end:', dayjs().format('YYYY-MM-DD HH:mm:ss'))
    console.log('-------')
  }, 5000)
}
/******** 博客内容编辑器弹出框配置部分 - end ********/

/******** 定义监听器部分 - start ********/
// 必须要在监听的变量定义之后，再定义监听器，或放在 onMounted 阶段定义监听器
// 所以监听器和计算属性，一般建议放到最后定义
watch(
  [
    () => blogFormData.blogId,
    () => blogFormData.editorType,
    () => userStore.user.editor_type,
  ], // 可同时监听多个变量或属性，数组表示
  (newVal, oldVal) => {
    // 同时监听多个变量或属性后， newVal 和 oldVal 也变为数组形式
    // !isChgEditor 表示不是手动切换编辑器时，才执行此监听器里的当前监听器逻辑判断操作，当 isChgEditor = true时,
    // 由 changeEditor() 函数里直接确定当前编辑器即可，否则当用户默认编辑器为 HTML(userStore.user.editor_type=0)
    // 并且新建博客时 blogFormData.blogId 为空，会执行监听器里的
    // if((!blogFormData.blogId && userStore.user.editor_type == 0) || blogFormData.editorType == 0)
    // 监听器执行后，会导致当前编辑器变量 currentEditor 永远为0，导致新建博客时无法手动切换编辑器，修改博客可以切换
    if (!isChgEditor) {
      if (
        (!blogFormData.blogId && userStore.user.editor_type == 0) ||
        blogFormData.editorType == 0
      ) {
        currentEditor.value = 0
      } else {
        currentEditor.value = 1
      }
    }
    // 跳过以上当前监听器判断操作后，必须要重置 isChgEditor = false，否则下次进入编辑器界面（新增/修改博客）会报错，
    // 因为后续还需要此监听器判断赋值给当前编辑器变量 currentEditor，依据此变量在界面上显示哪个编辑器的
    isChgEditor = false
    // 调试输出
    console.log(
      'currentEditor, blogFormData.editorType, userStore.user.editor_type',
      currentEditor.value,
      blogFormData.editorType,
      userStore.user.editor_type
    )
  },
  { immediate: true, deep: false }
)
/******** 定义监听器部分 - end ********/

// 向外暴露数据或方法
defineExpose({
  windowConfig,
  dialogConfig,
  blogFormData,
  clearFormData,
  autoSave,
  timer,
  currentEditor,
})
</script>

<style lang="scss">
/**** 设置/去除 el 组件的默认样式 - start ****/
// 去除表单验证不通过的红色边框
/* .el-form-item.is-error .el-input__wrapper {
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
} */
/**** 设置/去除 el 组件的默认样式 - end ****/

.blog-setting-form {
  .allow-comment {
    display: flex;
    align-items: center;
  }

  .tips {
    margin-left: 10px;
    color: rgb(175, 175, 175);
    font-size: 12px;
  }

  .blog-tag-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .icon-add {
      color: red;
      font-weight: bold;
      cursor: pointer;
    }

    .tag-input {
      width: 150px;
      height: 28px;
      margin-left: 4px;
    }
  }
}

.tips-info-box {
  margin: -10px 0 8px;
  text-align: left;
  font-size: 11px;
  color: #f3753a;

  span {
    margin-right: 10px;
  }

  .editor-switch-tips {
    cursor: pointer;
  }
}

// 为 ElMessageBox 组件的 customClass 参数设置的允许提示内容换行的样式
.msgbox-wrap {
  white-space: pre-line;
}
</style>