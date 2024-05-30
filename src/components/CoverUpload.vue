<template>
  <!-- 
    list-type="picture-card"  缩略图卡片式上传，比较美观
    http-request： 表示使用自定义的上传方法，不使用自带的上传方法
    drag：是否拖拽上传
    on-change：文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
    action：上传 url ，开启自动上传 :auto-upload="true" ，并且不指定 http-request 自定义上传才有效
    accept: 只是在文件选择框优先过淲显示指定格式的文件，但仍可以选择所有其它文件成功上传，应在业务逻辑再过淲判断文件类型
   -->
  <el-upload
    name="file"
    action="file/uploadImage"
    accept=".png, .jpg, .jpeg, .gif, .bmp"
    :show-file-list="false"
    :multiple="false"
    :limit="1"
    :http-request="uploadImage"
    :auto-upload="false"
    :on-change="onChangeAction"
    ref="elUploadRef"
  >
    <div class="cover-box">
      <div v-if="cover_src" class="cover-preview">
        <img :src="cover_src" />
      </div>
      <div v-else class="cover-choose-btn">
        <span class="iconfont icon-add"></span>
      </div>
    </div>
  </el-upload>
</template>

<script setup>
// 导入 vue API
import {
  ref,
  reactive,
  defineComponent,
  getCurrentInstance,
  computed,
  inject,
  nextTick,
} from 'vue'

// 获取类 vue 实例对象
const { proxy } = getCurrentInstance()

// 导入 pinia userStore 模块
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

// 为组件设置组件名
defineOptions({ name: 'CoverUpload' })

// 注入父组件 BlogCategory.vue 提供过来的依赖数据
const p_dialogConfig = inject('dialogConfig')
const p_tableData = inject('tableData')

const props = defineProps({
  // 名字固定为 modelValue ，用于在父组件中通过 v-model 双向梆定传值过来
  modelValue: {
    type: String,
    default: () => '',
  },
  // 分类类型，0：博客分类，1：专题分类
  categoryType: {
    type: Number,
    default: () => 0,
  },
})

const emit = defineEmits(['update:modelValue'])

// 定义接口 API url
const api = {
  uploadUrl: 'file/uploadImage',
}

// 保存当前选择的图片文件
let chooseCoverImg = null

// 以下 onChangeAction 事件函数，选择图片后，使用 FileReader 把图片转换为 base64 本地格式，
// 保存到该 cover_src 变量的，赋值给预览图 img.src 进行显示
let local_cover_src = ref('')

// 定义计算属性：到底是显示编辑分类传过来的缩略图（formData.cover），还是新增分类时的预览图
const cover_src = computed({
  get() {
    if (local_cover_src.value) {
      return local_cover_src.value
    } else if (props.modelValue) {
      return proxy.globalInfo.imageUrl + props.modelValue
    }
    return ''
  },
  set(newVal) {
    local_cover_src.value = newVal
  },
})

// el-upload 组件 on-change 事件函数：文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
// 选择图片后，uploadFile.status='ready'，只有开启自动上传 :auto-upload="true"，上传成功后，
// 才uploadFile.status='success'，否则只是选择图片时调用一次此 on-change 函数
const onChangeAction = async (uploadFile, uploadFiles) => {
  console.log('onChangeAction:', uploadFile, uploadFiles)

  // 选择图片后，马上清空一下选择图片列表，否则再次点击，不会弹出图片选择框进行重新选择，也不会再次执行此 on-change 事件
  // 函数，也就是说第二之后点击选择图片，以下代码也不会再执行
  proxy.$refs.elUploadRef.clearFiles()

  if (uploadFile.status === 'ready') {
    if (!uploadFile || uploadFile.size <= 0) {
      return proxy.Message.error('文件异常或已损坏，请重新选择')
    }

    // 获取上传文件的扩展名，判断只能上传指定格式的图片
    const fileExtname = uploadFile.name
      .substring(uploadFile.name.lastIndexOf('.') + 1)
      .toLowerCase()
    const allowExtname = ['png', 'jpg', 'jpeg', 'gif', 'bmp']

    if (!allowExtname.includes(fileExtname)) {
      const allowExtnameStr = allowExtname.join('、')
      return proxy.Message.error(`只允许上传 ${allowExtnameStr} 格式的图片文件`)
    } else if (uploadFile.size > 2 * 1024 * 1024) {
      return proxy.Message.error('文件大小不能大于2M，请重新选择')
    }

    // 选择图片后，使用 FileReader 把传过来的文件流（uploadFile.raw）转换为 base64 格式的图片src，
    // 再赋值给预览图片 img.src
    let reader = new FileReader()
    reader.readAsDataURL(uploadFile.raw)
    reader.onload = function (e) {
      local_cover_src.value = this.result
    }

    // 保存当前选择的图片文件，以便 uploadImage 上传函数使用
    chooseCoverImg = uploadFile.raw
    // uploadImage(chooseCoverImg)  // 由点击 BlogCategory.vue 中的【确定】发起上传图片
  }
}

// 注入(inject)/获取父组件 BlogCategory.vue 通过 provide 提供的表单数据（依赖数据）
// inject/provide 必须在 setup()内顶层声明，不能在其它函数内获取，$nextTick()也不行
const formData = inject('formData')
const loadDataList = inject('loadDataList') // 函数也能注入：注入父组件的重新加载表格数据的函数

// 上传图片处理函数
const uploadImage = async (uploadFile) => {
  console.log('uploadImage chooseCoverImg:', chooseCoverImg)

  // 获取分类ID，如果是新增分类，分类ID为 null
  let category_id = formData.categoryId ? formData.categoryId : null

  // 组装发送给后端的数据：上传后的图片文件名，由后端命名如：<时间串>_<user_id>_<category_id>_<4位随机数>.jpg 组成
  const postData = {
    user_id: userStore.user.user_id,
    category_id,
    category_name: formData.categoryName,
    category_desc: formData.categoryDesc,
    category_type: props.categoryType,
  }

  // console.log('uploadImage postData:', postData)

  // 发起上传图片请求
  const result = await proxy.Request({
    url: api.uploadUrl,
    dataType: 'file',
    params: {
      file: chooseCoverImg,
      // 由于Request封装函数没做处理，这里必须转为json字符串发送 dataType:'file'(multipart/form-data) 类型的请求，
      // 否则后端接收不到对象数据
      data: JSON.stringify(postData),
    },
  })

  console.log('uploadImage result:', result)

  if (result && result.code === 200) {
    chooseCoverImg = null // 上传成功后，清除当前选择的文件
    const fileName = result.data.filename // 返回的上传图片文件名 avatar/xxxxxx
    emit('update:modelValue', fileName)
    proxy.$nextTick(() => {
      console.log('上传图片后 modelValue:', props.modelValue)
    })

    // 关闭分类编辑框
    p_dialogConfig.show = false

    // 判断是新增还是修改分类
    let type = formData.categoryId ? 'update' : 'add'

    // 更新表格显示的对应的分类条目
    // return console.log('p_tableData', p_tableData)
    // array.some((item,index,arr)=>{}, thisRef) 函数，返回 true/false，找到后，return true 即停止循环，
    // array.every()即相反，return false 停止循环，return true 继续循环
    if (type === 'update') {
      p_tableData.list.some((item, index, arr) => {
        if (item.categoryId === formData.categoryId) {
          Object.assign(item, formData) // 响应式数据，属性是对象的更改，不要直接用 = 号赋值，无法实现响应式
          proxy.Message.success('数据修改成功！')
          return true
        }
        // console.log('item', item)
        // return false
      })
    } else {
      // 否则如果是新增分类，则新增数据添加到分类表格行显示
      // 为刚添加的分类的博客数量置为显示0
      formData.blogCount = 0
      // 添加新增分类信息到表格数据行显示
      p_tableData.list.push(formData)
      proxy.Message.success('数据添加成功！')
      // 执行从父组件注入的重新加载表格数据，专题组件 specialList.vue 需传 reload 重置页码为1和重新计算记录数
      loadDataList('reload')
    }
  }
}

// 上传图片完成后，清空保存图片路径的 modelValue
const clearModelValue = () => {
  // console.log('modelValue', props.modelValue)
  emit('update:modelValue', '')
  local_cover_src.value = ''
  proxy.$nextTick(() => {
    console.log('modelValue', props.modelValue)
  })
}

// 向外（其它组件）暴露数据或方法，否则其它组件通过 $refs 无法访问到需要的数据或方法
// defineExpose API直接使用，无需 import
defineExpose({
  local_cover_src,
  cover_src,
  uploadImage,
  clearModelValue,
})
</script>

<style lang="scss" scoped>
.cover-box {
  width: 120px;
  height: 120px;

  .cover-choose-btn {
    width: 100%;
    height: 100%;
    background: url('../assets/cover_bg.png');
    border: 1px solid #ddd;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon-add {
      font-size: 40px;
      color: rgb(164, 164, 164);
    }
  }

  .cover-preview {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>