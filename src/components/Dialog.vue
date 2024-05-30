<template>
  <!-- 当作为封装组件和提供插槽使用时，以下 el-dialog 的 model-value 是否显示参数，要设置为 true，
  在这里顶层的的 div 用 v-show 控制该封装组件Dialog是否显示，而不能用 v-if 控制， v-if 条件不成立时会销毁组件，
  使该组件之前梆定的插槽数据，如 blogFormData、settingsFormData 数据不能正常访问 resetFields() 清除之前的表单域数据
   -->
  <div v-show="showDialog">
    <!-- 
        show-close：是否显示右角关闭按钮X
        title：对话框标题
        modal:是否需要遮罩层
        draggable: 是否可拖拽
        close-on-click-modal: 点击对话框外，是否关闭对话框
        top：对话框的 margin-top，默认为 15vh
        width：对话框的宽度，默认为 50%
     -->
    <el-dialog
      :show-close="showClose"
      :draggable="true"
      :model-value="true"
      :close-on-click-modal="false"
      :title="title"
      class="cust-dialog"
      :top="top"
      :width="width"
      :modal="true"
      :before-close="btnCancel"
    >
      <div class="dialog-body">
        <!-- 定义一个默认插槽 -->
        <slot />
      </div>

      <div class="dialog-footer">
        <template v-if="buttons && buttons.length > 0">
          <el-button
            v-for="(btn, i) in buttons"
            :key="i"
            :type="btn.type"
            @click="btn.click"
            >{{ btn.text }}</el-button
          >
        </template>
        <!-- 是否显示取消按钮  -->
        <el-button v-if="showCancel" type="primary" @click="btnCancel()"
          >取消</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  // 是否显示对话框
  show: {
    type: Boolean,
    default: true,
  },
  // 对话框标题
  title: {
    type: String,
    defalut: '对话框',
  },
  // 是否显示右上角关闭按钮X
  showClose: {
    type: Boolean,
    default: true,
  },
  // 是否显示取消按钮
  showCancel: {
    type: Boolean,
    default: true,
  },
  // 对话框的 margin-top 属性
  top: {
    type: String,
    default: '15vh', // 官方默认为窗口高度15%
  },
  // 对话框的宽度
  width: {
    type: String,
    default: '30%', // 官方默认为50%
  },
  // 按钮数
  buttons: {
    type: Array,
    default: [],
  },
  // 父组件是否传取消按钮事件函数，有，则显示按钮，并执行此事件函数
  cancel: {
    type: Function,
    default: null,
  },
})

// 用于在取消按钮  btnCancel 事件函数中点击更改该值，关闭对话框的控制变量，因为不能直接更改 props.show
let showDialog = ref(null)
watch(
  () => props.show,
  (newVal, oldVal) => {
    showDialog.value = newVal
  },
  { immediate: true }
)

// 点击取消按钮判断是触发父组件的取消事件，还是本组件的取消事件，并执行
// const emit = defineEmits(['cancel'])
const btnCancel = (done = null) => {
  // 如果传过来的 cancel props属性是一个函数，就执行父组件的 cancel 事件
  if (typeof props.cancel === 'function') {
    props.cancel()
  } else {
    // 否则就执行本组件的控制变量 showDialog 关闭对话框
    showDialog.value = false
    console.log('在Dialog组件内关闭对话框')
  }

  // 清空缩略图及预览数据：注释掉，由父组件 BlogCategory.vue 和 BlogList.vue 的 showEdit 方法处理
  // proxy.$parent.$refs.coverUploadRef.$refs.elUploadRef.abort()
  // proxy.$parent.$refs.coverUploadRef.local_cover_src = ''
  // console.log(proxy.$parent.$refs.coverUploadRef.local_cover_src)

  // 如果是点击对话框组件 el-dialog 在上角的X关闭按钮，会传一个 done() 函数过来，必须执行该函数才会隐藏对话框
  // 当然，这里是自己加的[取消]按钮和 el-dialog 的关闭前回调参数 before-close 共同了这个 btnCancel 处理函数，
  // 只要以上对话显示的控制变量 showDialog.value 为 false，就能关闭对话框，不用以下 done() 函数 也可以，
  // 如果是为关闭前回调参数 before-close 指定单独的回调函数，执行 done() 才会销毁 el-dialog 组件
  // 【注意】共用事件处理函数时，取消按钮赋值事件函数时，要加()号@click="btnCancel()"，否则会传 event 事件参数
  // 到 done 参数中
  // done && done()  // 修改 Dialog.vue 组件的 el-dialog 组件中的 model-value 为 true，改为在顶层 div 用 v-show
  // 控制 Dialog 组件是否隐藏后，要注释这行，否则点击对话框右上角的交叉关闭后，无法再打开显示对话框
}
</script>

<style lang="scss">
.cust-dialog {
  // 为对话框标题底部（body顶部)添加边框线
  .el-dialog__body {
    padding: 0 6px;
  }
  .dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    min-height: 80px;
    padding: 20px 20px 0 20px;
  }
  .dialog-footer {
    padding: 15px 10px;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    text-align: right;
    .el-button {
      margin-left: 20px;
    }
  }
}
</style>