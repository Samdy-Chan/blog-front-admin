<template>
  <!-- 这里必须要用 v-show，不能用 v-if，否则进入编辑框和详细设置对话框填写信息，取消退出后，再进入提交，
清除不了编辑框和详细设置对话框的表单域内容，因为如果用 v-if 取消退出后，该 Window 组件已销毁，点击新增博客或修改进入
编辑界面，是另外一个 Windows 组件实例了，可能 resetField() 不了之前的 Windows 组件实例下梆定的表单域数据 -->
  <div v-show="show" class="window" :style="{ width: windowWidth + 'px' }">
    <div class="title">
      <span class="iconfont icon-back" @click="close"></span>
    </div>
    <div class="body">
      <slot name="body">body slot</slot>
    </div>

    <template v-if="(buttons && buttons.length > 0) || showCancel">
      <div class="footer">
        <el-button v-for="(btn, index) in buttons" :key="index" @click="btn.click" :type="btn.type">
          {{ btn.text }}
        </el-button>
        <el-button v-if="showCancel" @click="close" type="primary">取消</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 声明获取传递过来的组件属性参数 props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  buttons: {
    type: Array,
    default: () => [],
  },
  showCancel: {
    type: Boolean,
    default: () => true,
  },
})

// 声明获取传递过来的组件事件 emits
const emit = defineEmits(['close'])

// 关闭弹出框事件
function close() {
  emit('close')
}

// 组件的宽度为：整个浏览器可见窗口宽度 - 左侧边栏的宽度260
let windowWidth = ref(window.innerWidth - 260)
</script>

<style lang="scss" scoped>
.window {
  //   display: none;
  position: absolute;
  top: 0;
  left: 0;
  // 高度=浏览器窗口总高度100vh-(顶部header栏60 + right-main的padding-bottom20)，这样不会出现滚动条
  height: calc(100vh - 80px);
  background-color: #fff;
  // opacity: 0.8;
  z-index: 9;

  .title {
    height: 30px;
    display: flex;
    align-items: center;
    padding-left: 10px;

    .icon-back {
      font-size: 20px;
      cursor: pointer;
    }

    // background-color: skyblue;
  }

  .body {
    // 浏览器窗口宽度 - 顶部header80 - .title30 - .footer50
    height: calc(100vh - 160px);
    padding: 10px;
    overflow: auto;
    // background-color: orange;
  }

  .footer {
    text-align: center;
    line-height: 50px;
    border-top: 1px solid #ddd;
    // background-color: #ddd;
    position: relative;
    z-index: 9;
  }
}
</style>