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
    action="file/uploadImg"
    accept=".png, .jpg, .jpeg, .gif, .bmp"
    :show-file-list="false"
    :multiple="false"
    :limit="1"
    :auto-upload="false"
    :on-change="onChangeAction"
    ref="elUploadRef"
  >
    <div class="cover-box">
      <div v-if="cover_src" class="cover-preview">
        <img :src="proxy.globalInfo.imageUrl + cover_src" />
      </div>
      <div v-else class="cover-choose-btn">
        <span class="iconfont icon-add"></span>
      </div>
    </div>
  </el-upload>
</template>

<script setup>
// 导入 vue API
import { ref, reactive, getCurrentInstance, watch } from 'vue'

// 获取类 vue 实例对象
const { proxy } = getCurrentInstance()

// 导入操作 cookie 的模块
import VueCookies from 'vue-cookies'

// 为组件设置组件名
defineOptions({ name: 'BlogCoverUpload' })

// 声明并获取传递参数
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// 声明并获取传递事件
const emit = defineEmits()

// 保存上传成功，后端返回的图片地址，拼装路径前缀后，显示到图片上传组件
let cover_src = ref('')

// 创建接收图片路径双向梆定变量的 modelValue 的监视器，并同步更新到 cover_src 变量中
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    cover_src.value = newVal
  },
  { immediate: true }
)

// 获取用户 user_id
const user_id = VueCookies.get('userInfo')?.user_id

/****************** 方法函数定义 - start ******************/
// el-upload 组件 on-change 事件函数：文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
// 选择图片后，uploadFile.status='ready'，只有开启自动上传 :auto-upload="true"，上传成功后，
// 才uploadFile.status='success'，否则只是选择图片时调用一次此 on-change 函数
async function onChangeAction(uploadFile, uploadFiles) {
  // console.log('onChangeAction uploadFile:', uploadFile)
  // console.log('onChangeAction uploadFiles:', uploadFiles)

  // 选择图片后，马上清空一下选择图片列表，否则再次点击，不会弹出图片选择框进行重新选择，也不会再次执行此 on-change 事件
  // 函数，也就是说第二之后点击选择图片，以下代码也不会再执行
  proxy.$refs.elUploadRef.clearFiles()

  let chkFileStatus = proxy.Tools.chkFile(uploadFile)
  // 如果选择图片文件检查通过，开始上传
  if (chkFileStatus) {
    const result = await proxy.Request({
      url: '/file/uploadImg',
      dataType: 'file',
      params: {
        file: uploadFile.raw,
        data: JSON.stringify({
          user_id,
        }),
      },
    })

    if (result?.code === 200) {
      cover_src.value = result.data.file.filename
      emit('update:modelValue', cover_src.value)
    }
  }
}
/****************** 方法函数定义 - end ******************/

// 向外暴露数据或方法
defineExpose({
  cover_src,
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